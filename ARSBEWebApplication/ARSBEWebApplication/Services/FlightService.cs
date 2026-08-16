using ARSBEWebApplication.DTOs.Common;
using ARSBEWebApplication.DTOs.Flights;
using ARSBEWebApplication.Exceptions;
using ARSBEWebApplication.Models;
using ARSBEWebApplication.Repositories.Interfaces;
using ARSBEWebApplication.Services.Interfaces;

namespace ARSBEWebApplication.Services
{
    public class FlightService : IFlightService
    {
        private readonly IFlightRepository _flightRepository;
        private readonly ISeatRepository _seatRepository;

        public FlightService(IFlightRepository flightRepository, ISeatRepository seatRepository)
        {
            _flightRepository = flightRepository;
            _seatRepository = seatRepository;
        }

        public async Task<PagedResultDto<FlightDto>> SearchFlightsAsync(
    string? origin, string? destination, DateTime? date, int pageNumber, int pageSize)
        {
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            pageSize = pageSize < 1 ? 6 : pageSize;

            var (flights, totalCount) = await _flightRepository.SearchAsync(origin, destination, date, pageNumber, pageSize);

            var items = new List<FlightDto>();
            foreach (var f in flights)
                items.Add(await MapToDtoAsync(f));

            return new PagedResultDto<FlightDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<FlightDto> GetFlightByIdAsync(int id)
        {
            var flight = await _flightRepository.GetByIdAsync(id);
            if (flight == null)
                throw new NotFoundException($"Flight with ID {id} not found.");

            return await MapToDtoAsync(flight);
        }

        public async Task<IEnumerable<SeatDto>> GetSeatsForFlightAsync(int flightId)
        {
            var flight = await _flightRepository.GetByIdAsync(flightId);
            if (flight == null)
                throw new NotFoundException($"Flight with ID {flightId} not found.");

            var seats = await _seatRepository.FindAsync(s => s.FlightId == flightId);
            return seats.Select(s => new SeatDto
            {
                Id = s.Id,
                SeatNumber = s.SeatNumber,
                SeatClass = s.SeatClass,
                IsAvailable = s.IsAvailable
            });
        }

        public async Task<FlightDto> CreateFlightAsync(CreateFlightDto dto)
        {
            if (dto.EconomySeats + dto.BusinessSeats != dto.TotalSeats)
                throw new BadRequestException("EconomySeats + BusinessSeats must equal TotalSeats.");

            var flight = new Flight
            {
                FlightNumber = dto.FlightNumber,
                Origin = dto.Origin,
                Destination = dto.Destination,
                DepartureTime = dto.DepartureTime,
                ArrivalTime = dto.ArrivalTime,
                TotalSeats = dto.TotalSeats,
                Price = dto.Price
            };

            await _flightRepository.AddAsync(flight);
            await _flightRepository.SaveChangesAsync(); // need flight.Id before creating seats

            // Auto-generate seats: Business rows first (1A, 1B...), then Economy
            var seats = GenerateSeats(flight.Id, dto.BusinessSeats, "Business", startRow: 1)
                .Concat(GenerateSeats(flight.Id, dto.EconomySeats, "Economy", startRow: (dto.BusinessSeats / 6) + 1))
                .ToList();

            foreach (var seat in seats)
                await _seatRepository.AddAsync(seat);

            await _seatRepository.SaveChangesAsync();

            return await MapToDtoAsync(flight);
        }

        public async Task DeleteFlightAsync(int id)
        {
            var flight = await _flightRepository.GetByIdAsync(id);
            if (flight == null)
                throw new NotFoundException($"Flight with ID {id} not found.");

            var hasActiveReservations = (await _seatRepository.FindAsync(s => s.FlightId == id && !s.IsAvailable)).Any();
            if (hasActiveReservations)
                throw new BadRequestException("This flight has active reservations and cannot be deleted. Cancel all bookings first.");

            _flightRepository.Remove(flight);
            await _flightRepository.SaveChangesAsync();
        }

        private static List<Seat> GenerateSeats(int flightId, int count, string seatClass, int startRow)
        {
            var seats = new List<Seat>();
            var letters = new[] { "A", "B", "C", "D", "E", "F" };
            int row = startRow, col = 0;

            for (int i = 0; i < count; i++)
            {
                seats.Add(new Seat
                {
                    FlightId = flightId,
                    SeatNumber = $"{row}{letters[col]}",
                    SeatClass = seatClass,
                    IsAvailable = true
                });

                col++;
                if (col == letters.Length) { col = 0; row++; }
            }

            return seats;
        }

        private async Task<FlightDto> MapToDtoAsync(Flight flight)
        {
            var availableCount = (await _seatRepository.GetAvailableSeatsByFlightAsync(flight.Id)).Count();

            return new FlightDto
            {
                Id = flight.Id,
                FlightNumber = flight.FlightNumber,
                Origin = flight.Origin,
                Destination = flight.Destination,
                DepartureTime = flight.DepartureTime,
                ArrivalTime = flight.ArrivalTime,
                TotalSeats = flight.TotalSeats,
                AvailableSeatsCount = availableCount,
                Price = flight.Price
            };
        }
        public async Task<FlightDto> UpdateFlightAsync(int id, UpdateFlightDto dto)
        {
            var flight = await _flightRepository.GetByIdAsync(id);
            if (flight == null)
                throw new NotFoundException($"Flight with ID {id} not found.");

            flight.FlightNumber = dto.FlightNumber;
            flight.Origin = dto.Origin;
            flight.Destination = dto.Destination;
            flight.DepartureTime = dto.DepartureTime;
            flight.ArrivalTime = dto.ArrivalTime;
            flight.Price = dto.Price;

            _flightRepository.Update(flight);
            await _flightRepository.SaveChangesAsync();

            return await MapToDtoAsync(flight);
        }
    }
}