using EventosCostaRica.Data;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Data
{
    public class EventoCreateDTO
    {
        [Required(ErrorMessage = "El nombre del evento es obligatorio.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 100 caracteres.")]
        public required string Name { get; set; }

        [StringLength(1000, ErrorMessage = "La descripcion no puede exceder los 1000 caracteres.")]
        public string? Descrp { get; set; }

        [Required(ErrorMessage = "La fecha del evento es obligatoria.")]
        public required DateTime EventoDate { get; set; }

        [Required(ErrorMessage = "La ubicacion es obligatoria.")]
        [StringLength(150, ErrorMessage = "La ubicacion no puede exceder los 150 caracteres.")]
        public required string Location { get; set; }

        //[Url(ErrorMessage = "El formato de la URL del banner no es valido.")]
        public string? BannerImageUrl { get; set; }

        [Range(2, 100, ErrorMessage = "El numero de filas debe ser entre 2 y 100.")]
        public int Rows { get; set; }

        [Range(2, 100, ErrorMessage = "El numero de asientos por fila debe ser entre 2 y 100.")]
        public int SeatsPerRow { get; set; }
    }

    public class EventoGetDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Descrp { get; set; }
        public DateTime EventoDate { get; set; }
        public string Location { get; set; }
        public string? BannerImageUrl { get; set; }
        public int Rows { get; set; }
        public int SeatsPerRow { get; set; }

        public int SeatsAvailable { get; set; }

        public EventoGetDTO(Evento evento) {
            Id = evento.Id;
            Name = evento.Name;
            Descrp = evento.Descrp;
            EventoDate = evento.EventoDate;
            Location = evento.Location;
            BannerImageUrl = evento.BannerImageUrl;
            Rows = evento.Rows;
            SeatsPerRow = evento.SeatsPerRow;
        }
    }

    public class EventoUpdateDTO: EventoCreateDTO
    {
        // Este DTO hereda de EventoCreateDTO para reutilizar las validaciones y propiedades comunes
    }

}
