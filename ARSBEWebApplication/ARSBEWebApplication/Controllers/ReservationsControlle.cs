using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ARSBEWebApplication.DTOs.Reservations;
using ARSBEWebApplication.Helpers;
using ARSBEWebApplication.Services.Interfaces;

namespace ARSBEWebApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // every action requires a valid JWT
    public class ReservationsController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public ReservationsController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        [HttpPost]
        public async Task<ActionResult<ReservationDto>> Create(CreateReservationDto dto)
        {
            var userId = User.GetUserId();
            var result = await _reservationService.CreateReservationAsync(userId, dto);
            return Ok(result);
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<ReservationDto>>> GetMyReservations()
        {
            var userId = User.GetUserId();
            var result = await _reservationService.GetMyReservationsAsync(userId);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Cancel(int id)
        {
            var userId = User.GetUserId();
            await _reservationService.CancelReservationAsync(userId, id);
            return NoContent();
        }
    }
}