using Microsoft.EntityFrameworkCore;
using ARSBEWebApplication.Data;
using ARSBEWebApplication.Models;
using ARSBEWebApplication.Repositories.Interfaces;

namespace ARSBEWebApplication.Repositories
{
    public class ReservationRepository : GenericRepository<Reservation>, IReservationRepository
    {
        public ReservationRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Reservation>> GetByUserIdAsync(int userId) =>
            await _dbSet
                .Include(r => r.Flight)
                .Include(r => r.ReservationSeats)
                    .ThenInclude(rs => rs.Seat)
                .Where(r => r.UserId == userId)
                .ToListAsync();

        public async Task<Reservation?> GetByIdWithDetailsAsync(int id) =>
            await _dbSet
                .Include(r => r.Flight)
                .Include(r => r.User)
                .Include(r => r.ReservationSeats)
                    .ThenInclude(rs => rs.Seat)
                .FirstOrDefaultAsync(r => r.Id == id);
    }
}