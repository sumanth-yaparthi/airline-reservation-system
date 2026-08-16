using Microsoft.EntityFrameworkCore;
using ARSBEWebApplication.Data;
using ARSBEWebApplication.Models;
using ARSBEWebApplication.Repositories.Interfaces;

namespace ARSBEWebApplication.Repositories
{
    public class FlightRepository : GenericRepository<Flight>, IFlightRepository
    {
        public FlightRepository(AppDbContext context) : base(context) { }

        public async Task<Flight?> GetByIdWithSeatsAsync(int id) =>
            await _dbSet.Include(f => f.Seats).FirstOrDefaultAsync(f => f.Id == id);

        public async Task<(List<Flight> Items, int TotalCount)> SearchAsync(
    string? origin, string? destination, DateTime? date, int pageNumber, int pageSize)
        {
            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrWhiteSpace(origin))
                query = query.Where(f => f.Origin.Contains(origin));

            if (!string.IsNullOrWhiteSpace(destination))
                query = query.Where(f => f.Destination.Contains(destination));

            if (date.HasValue)
                query = query.Where(f => f.DepartureTime.Date == date.Value.Date);

            query = query.OrderBy(f => f.DepartureTime);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}