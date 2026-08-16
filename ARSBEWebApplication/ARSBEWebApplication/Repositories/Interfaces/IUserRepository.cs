using ARSBEWebApplication.Models;
using static ARSBEWebApplication.Repositories.Interfaces.IGenericRepository;

namespace ARSBEWebApplication.Repositories.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
    }
}