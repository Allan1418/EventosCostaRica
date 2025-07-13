using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Data
{
    public class Evento
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        public string? Descrp { get; set; }

        [Required]
        public DateTime EventoDate { get; set; }

        [Required]
        [MaxLength(150)]
        public required string Location { get; set; }

        public string? BannerImageUrl { get; set; }

        public int Rows { get; set; }

        public int SeatsPerRow { get; set; }

        public virtual ICollection<Boleto> Boletos { get; set; } = new List<Boleto>();

        public virtual ICollection<BlockedSeat> BlockedSeats { get; set; } = new List<BlockedSeat>();
    }
}
