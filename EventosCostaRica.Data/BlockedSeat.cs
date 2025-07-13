using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Data
{
    public class BlockedSeat
    {
        public int Id { get; set; }
        public int EventoId { get; set; }
        public virtual required Evento Evento { get; set; }

        public int SeatRow { get; set; }
        public int SeatColumn { get; set; }
    }
}
