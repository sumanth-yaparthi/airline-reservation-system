using System.ComponentModel.DataAnnotations.Schema;

namespace ARSBEWebApplication.Models
{
    public class ReservationSeat
    {
        public int Id { get; set; }

        public int ReservationId { get; set; }
        [ForeignKey(nameof(ReservationId))]
        public Reservation? Reservation { get; set; }

        public int SeatId { get; set; }
        [ForeignKey(nameof(SeatId))]
        public Seat? Seat { get; set; }
    }
}
