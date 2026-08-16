using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ARSBEWebApplication.Models
{
    public class Reservation
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        public int FlightId { get; set; }
        [ForeignKey(nameof(FlightId))]
        public Flight? Flight { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Confirmed"; // Confirmed / Cancelled

        public DateTime BookingDate { get; set; } = DateTime.UtcNow;

        public ICollection<ReservationSeat> ReservationSeats { get; set; } = new List<ReservationSeat>();
    }
}
