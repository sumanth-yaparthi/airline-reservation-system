using ARSBEWebApplication.DTOs.Reservations;
using ARSBEWebApplication.Exceptions;
using ARSBEWebApplication.Models;
using ARSBEWebApplication.Repositories.Interfaces;
using ARSBEWebApplication.Services.Interfaces;

namespace ARSBEWebApplication.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly ISeatRepository _seatRepository;
        private readonly IFlightRepository _flightRepository;

        public ReservationService(
            IReservationRepository reservationRepository,
            ISeatRepository seatRepository,
            IFlightRepository flightRepository)
        {
            _reservationRepository = reservationRepository;
            _seatRepository = seatRepository;
            _flightRepository = flightRepository;
        }

        public async Task<ReservationDto> CreateReservationAsync(int userId, CreateReservationDto dto)
        {
            var flight = await _flightRepository.GetByIdAsync(dto.FlightId);
            if (flight == null)
                throw new NotFoundException("Flight not found.");

            if (flight.DepartureTime <= DateTime.Now)
                throw new BadRequestException("This flight has already departed and can no longer be booked.");

            var seats = (await _seatRepository.GetSeatsByIdsAsync(dto.SeatIds)).ToList();

            if (seats.Count != dto.SeatIds.Count)
                throw new BadRequestException("One or more selected seats do not exist.");

            if (seats.Any(s => s.FlightId != dto.FlightId))
                throw new BadRequestException("One or more seats do not belong to the selected flight.");

            var unavailable = seats.Where(s => !s.IsAvailable).ToList();
            if (unavailable.Any())
                throw new BadRequestException(
                    $"Seat(s) {string.Join(", ", unavailable.Select(s => s.SeatNumber))} are no longer available.");

            var reservation = new Reservation
            {
                UserId = userId,
                FlightId = dto.FlightId,
                Status = "Confirmed",
                BookingDate = DateTime.UtcNow,
                ReservationSeats = seats.Select(s => new ReservationSeat { SeatId = s.Id }).ToList()
            };

            foreach (var seat in seats)
                seat.IsAvailable = false;

            await _reservationRepository.AddAsync(reservation);
            // seat updates are already tracked by EF Core via the loaded entities
            await _reservationRepository.SaveChangesAsync(); // single commit: reservation + seat updates together

            var saved = await _reservationRepository.GetByIdWithDetailsAsync(reservation.Id);
            return MapToDto(saved!);
        }

        public async Task<IEnumerable<ReservationDto>> GetMyReservationsAsync(int userId)
        {
            var reservations = await _reservationRepository.GetByUserIdAsync(userId);
            return reservations.Select(MapToDto);
        }

        public async Task CancelReservationAsync(int userId, int reservationId)
        {
            var reservation = await _reservationRepository.GetByIdWithDetailsAsync(reservationId);
            if (reservation == null)
                throw new NotFoundException("Reservation not found.");

            if (reservation.UserId != userId)
                throw new UnauthorizedException("You are not allowed to cancel this reservation.");

            if (reservation.Status == "Cancelled")
                throw new BadRequestException("This reservation is already cancelled.");

            if (reservation.Flight != null && reservation.Flight.DepartureTime <= DateTime.Now)
                throw new BadRequestException("This flight has already departed and cannot be cancelled.");

            reservation.Status = "Cancelled";

            foreach (var rs in reservation.ReservationSeats)
                if (rs.Seat != null)
                    rs.Seat.IsAvailable = true;

            await _reservationRepository.SaveChangesAsync();
        }

        private static ReservationDto MapToDto(Reservation r) => new()
        {
            Id = r.Id,
            FlightNumber = r.Flight?.FlightNumber ?? "",
            Origin = r.Flight?.Origin ?? "",
            Destination = r.Flight?.Destination ?? "",
            DepartureTime = r.Flight?.DepartureTime ?? default,
            Status = r.Status,
            BookingDate = r.BookingDate,
            SeatNumbers = r.ReservationSeats.Select(rs => rs.Seat?.SeatNumber ?? "").ToList(),
            TotalPrice = (r.Flight?.Price ?? 0) * r.ReservationSeats.Count
        };
    }
}