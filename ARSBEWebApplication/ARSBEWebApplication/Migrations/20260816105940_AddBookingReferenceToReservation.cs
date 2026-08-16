using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ARSBEWebApplication.Migrations
{
    public partial class AddBookingReferenceToReservation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BookingReference",
                table: "Reservations",
                type: "nvarchar(12)",
                maxLength: 12,
                nullable: false,
                defaultValue: "");

            // Backfill existing rows with a unique value BEFORE the unique index is created,
            // since every existing row currently has the same default value ('').
            migrationBuilder.Sql(
                "UPDATE Reservations SET BookingReference = CONCAT('LEGACY', RIGHT('00000' + CAST(Id AS VARCHAR(5)), 5)) WHERE BookingReference = '';");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_BookingReference",
                table: "Reservations",
                column: "BookingReference",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Reservations_BookingReference",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "BookingReference",
                table: "Reservations");
        }
    }
}
