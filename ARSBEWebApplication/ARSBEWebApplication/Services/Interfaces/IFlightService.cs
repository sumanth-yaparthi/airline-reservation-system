using ARSBEWebApplication.DTOs.Flights;

namespace ARSBEWebApplication.Services.Interfaces
{
    public interface IFlightService
    {
        Task<IEnumerable<FlightDto>> SearchFlightsAsync(string? origin, string? destination, DateTime? date);
        Task<FlightDto> GetFlightByIdAsync(int id);
        Task<IEnumerable<SeatDto>> GetSeatsForFlightAsync(int flightId);
        Task<FlightDto> CreateFlightAsync(CreateFlightDto dto);
        Task DeleteFlightAsync(int id);
    }
}