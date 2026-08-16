namespace ARSBEWebApplication.DTOs.Reservations
{
    public class ReservationDto
    {
        public int Id { get; set; }
        public string BookingReference { get; set; } = string.Empty;
        public string PassengerName { get; set; } = string.Empty;
        public string FlightNumber { get; set; } = string.Empty;
        public string Origin { get; set; } = string.Empty;
        public string Destination { get; set; } = string.Empty;
        public DateTime DepartureTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime BookingDate { get; set; }
        public List<string> SeatNumbers { get; set; } = new();
        public decimal TotalPrice { get; set; }
    }
}