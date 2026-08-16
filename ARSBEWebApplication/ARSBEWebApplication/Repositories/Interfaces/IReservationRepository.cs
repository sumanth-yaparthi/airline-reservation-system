using ARSBEWebApplication.Models;
using static ARSBEWebApplication.Repositories.Interfaces.IGenericRepository;

namespace ARSBEWebApplication.Repositories.Interfaces
{
    public interface IReservationRepository : IGenericRepository<Reservation>
    {
        Task<IEnumerable<Reservation>> GetByUserIdAsync(int userId);
        Task<Reservation?> GetByIdWithDetailsAsync(int id);
    }
}