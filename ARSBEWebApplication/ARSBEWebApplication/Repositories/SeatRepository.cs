using Microsoft.EntityFrameworkCore;
using ARSBEWebApplication.Data;
using ARSBEWebApplication.Models;
using ARSBEWebApplication.Repositories.Interfaces;

namespace ARSBEWebApplication.Repositories
{
    public class SeatRepository : GenericRepository<Seat>, ISeatRepository
    {
        public SeatRepository(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Seat>> GetAvailableSeatsByFlightAsync(int flightId) =>
            await _dbSet.Where(s => s.FlightId == flightId && s.IsAvailable).ToListAsync();

        public async Task<IEnumerable<Seat>> GetSeatsByIdsAsync(IEnumerable<int> seatIds) =>
            await _dbSet.Where(s => seatIds.Contains(s.Id)).ToListAsync();
    }
}