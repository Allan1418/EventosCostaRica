using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Data
{
    public class BoletoCreateDTO
    {
        [Required(ErrorMessage = "El Id del evento es obligatorio.")]
        public int EventoId { get; set; }

        [Required(ErrorMessage = "El SeatRow es obligatorio.")]
        [Range(0, int.MaxValue, ErrorMessage = "El SeatRow debe ser un numero positivo.")]
        public int SeatRow { get; set; }

        [Required(ErrorMessage = "El SeatColumn es obligatorio.")]
        [Range(0, int.MaxValue, ErrorMessage = "El SeatColumn debe ser un numero positivo.")]
        public int SeatColumn { get; set; }
    }

    public class BoletoGetDTO
    {
        public int Id { get; set; }
        public DateTime PurchaseDate { get; set; }

        public int EventoId { get; set; }

        public string UsuarioId { get; set; }

        public int SeatRow { get; set; }

        public int SeatColumn { get; set; }

        public BoletoGetDTO(Boleto boleto)
        {
            Id = boleto.Id;
            PurchaseDate = boleto.PurchaseDate;
            EventoId = boleto.EventoId;
            UsuarioId = boleto.UsuarioId;
            SeatRow = boleto.SeatRow;
            SeatColumn = boleto.SeatColumn;
        }
    }

}
