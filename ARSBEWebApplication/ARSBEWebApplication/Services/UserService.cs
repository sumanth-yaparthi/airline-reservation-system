using ARSBEWebApplication.DTOs.Users;
using ARSBEWebApplication.Exceptions;
using ARSBEWebApplication.Repositories.Interfaces;
using ARSBEWebApplication.Services.Interfaces;

namespace ARSBEWebApplication.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<UserProfileDto> GetProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("User not found.");

            return MapToDto(user);
        }

        public async Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("User not found.");

            // If changing email, make sure the new one isn't already taken by someone else
            if (!string.Equals(user.Email, dto.Email, StringComparison.OrdinalIgnoreCase))
            {
                var existing = await _userRepository.GetByEmailAsync(dto.Email);
                if (existing != null && existing.Id != userId)
                    throw new BadRequestException("This email is already in use by another account.");
            }

            user.FullName = dto.FullName;
            user.Email = dto.Email;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return MapToDto(user);
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new NotFoundException("User not found.");

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                throw new BadRequestException("Current password is incorrect.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            // Invalidate any existing refresh token — changing password should force
            // re-authentication everywhere else this account is logged in
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();
        }

        private static UserProfileDto MapToDto(Models.User user) => new()
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };
    }
}