using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Data
{
    public class Boleto
    {
        public int Id { get; set; }

        [Required]
        public DateTime PurchaseDate { get; set; }

        public int EventoId { get; set; }
        public virtual Evento? Evento { get; set; }


        public required string UsuarioId { get; set; }
        public virtual Usuario? Usuario { get; set; }

        public int SeatRow { get; set; }

        public int SeatColumn { get; set; }
    }
}
