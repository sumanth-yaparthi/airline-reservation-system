using Microsoft.EntityFrameworkCore;
using ARSBEWebApplication.Data;
using ARSBEWebApplication.Models;
using ARSBEWebApplication.Repositories.Interfaces;

namespace ARSBEWebApplication.Repositories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context) { }

        public async Task<User?> GetByEmailAsync(string email) =>
            await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }
}