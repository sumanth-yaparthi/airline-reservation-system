namespace ARSBEWebApplication.DTOs.Flights
{
    public class SeatDto
    {
        public int Id { get; set; }
        public string SeatNumber { get; set; } = string.Empty;
        public string SeatClass { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
    }
}