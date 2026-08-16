using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ARSBEWebApplication.DTOs.Flights;
using ARSBEWebApplication.Services.Interfaces;

namespace ARSBEWebApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlightsController : ControllerBase
    {
        private readonly IFlightService _flightService;

        public FlightsController(IFlightService flightService)
        {
            _flightService = flightService;
        }

        // GET /api/flights?origin=NYC&destination=LAX&date=2026-09-01
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<FlightDto>>> Search(
            [FromQuery] string? origin,
            [FromQuery] string? destination,
            [FromQuery] DateTime? date)
        {
            var flights = await _flightService.SearchFlightsAsync(origin, destination, date);
            return Ok(flights);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<FlightDto>> GetById(int id)
        {
            var flight = await _flightService.GetFlightByIdAsync(id);
            return Ok(flight);
        }

        [HttpGet("{id}/seats")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<SeatDto>>> GetSeats(int id)
        {
            var seats = await _flightService.GetSeatsForFlightAsync(id);
            return Ok(seats);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FlightDto>> Create(CreateFlightDto dto)
        {
            var flight = await _flightService.CreateFlightAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = flight.Id }, flight);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _flightService.DeleteFlightAsync(id);
            return NoContent();
        }
    }
}