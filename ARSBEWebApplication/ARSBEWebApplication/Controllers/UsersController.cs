using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ARSBEWebApplication.DTOs.Users;
using ARSBEWebApplication.Helpers;
using ARSBEWebApplication.Services.Interfaces;

namespace ARSBEWebApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("me")]
        public async Task<ActionResult<UserProfileDto>> GetMe()
        {
            var result = await _userService.GetProfileAsync(User.GetUserId());
            return Ok(result);
        }

        [HttpPut("me")]
        public async Task<ActionResult<UserProfileDto>> UpdateMe(UpdateProfileDto dto)
        {
            var result = await _userService.UpdateProfileAsync(User.GetUserId(), dto);
            return Ok(result);
        }

        [HttpPut("me/password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            await _userService.ChangePasswordAsync(User.GetUserId(), dto);
            return NoContent();
        }
    }
}