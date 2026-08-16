using ARSBEWebApplication.Models;
using static ARSBEWebApplication.Repositories.Interfaces.IGenericRepository;

namespace ARSBEWebApplication.Repositories.Interfaces
{
    public interface IFlightRepository : IGenericRepository<Flight>
    {
        Task<Flight?> GetByIdWithSeatsAsync(int id);
        Task<IEnumerable<Flight>> SearchAsync(string? origin, string? destination, DateTime? date);
    }
}