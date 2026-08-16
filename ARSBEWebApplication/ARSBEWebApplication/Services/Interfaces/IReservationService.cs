using ARSBEWebApplication.DTOs.Reservations;

namespace ARSBEWebApplication.Services.Interfaces
{
    public interface IReservationService
    {
        Task<ReservationDto> CreateReservationAsync(int userId, CreateReservationDto dto);
        Task<IEnumerable<ReservationDto>> GetMyReservationsAsync(int userId);
        Task<ReservationDto> GetReservationByIdAsync(int userId, int reservationId);
        Task<ReservationDto> GetByBookingReferenceAsync(string bookingReference);
        Task CancelReservationAsync(int userId, int reservationId);
    }
}