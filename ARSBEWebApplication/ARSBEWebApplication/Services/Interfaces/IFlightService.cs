using ARSBEWebApplication.DTOs.Common;
using ARSBEWebApplication.DTOs.Flights;

namespace ARSBEWebApplication.Services.Interfaces
{
    public interface IFlightService
    {
        Task<PagedResultDto<FlightDto>> SearchFlightsAsync(
    string? origin, string? destination, DateTime? date, int pageNumber, int pageSize);
        Task<FlightDto> GetFlightByIdAsync(int id);
        Task<IEnumerable<SeatDto>> GetSeatsForFlightAsync(int flightId);
        Task<FlightDto> CreateFlightAsync(CreateFlightDto dto);
        Task DeleteFlightAsync(int id);
        Task<FlightDto> UpdateFlightAsync(int id, UpdateFlightDto dto);
    }
}