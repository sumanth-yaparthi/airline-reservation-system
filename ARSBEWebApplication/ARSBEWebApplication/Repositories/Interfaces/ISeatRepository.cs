using ARSBEWebApplication.Models;
using static ARSBEWebApplication.Repositories.Interfaces.IGenericRepository;

namespace ARSBEWebApplication.Repositories.Interfaces
{
    public interface ISeatRepository : IGenericRepository<Seat>
    {
        Task<IEnumerable<Seat>> GetAvailableSeatsByFlightAsync(int flightId);
        Task<IEnumerable<Seat>> GetSeatsByIdsAsync(IEnumerable<int> seatIds);
    }
}