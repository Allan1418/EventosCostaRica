using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EventosCostaRica.Data;
using EventosCostaRica.Repository;

namespace EventosCostaRica.Business
{
    public interface IEventoService
    {
        Task<EventoGetDTO> Create(EventoCreateDTO eventoCreateDTO);
        Task<EventoGetDTO> GetById(int id);
        Task<List<EventoGetDTO>> GetAll();
        Task Update(int id, EventoUpdateDTO eventoUpdateDTO);

        Task<GridDTO> GetGrid(int idEvento);

    }

    public class EventoService : IEventoService
    {
        private readonly IRepositoryEvento _repositoryEvento;
        private readonly IRepositoryBlockedSeat _repositoryBlockedSeat;
        private readonly IRepositoryBoleto _repositoryBoleto;
        public EventoService(
            IRepositoryEvento repository, 
            IRepositoryBlockedSeat repositoryBlockedSeat,
            IRepositoryBoleto repositoryBoleto
            )
        {
            _repositoryEvento = repository;
            _repositoryBlockedSeat = repositoryBlockedSeat;
            _repositoryBoleto = repositoryBoleto;
        }

        private async Task<EventoGetDTO> CalculateSeats(EventoGetDTO evento)
        {
            var blockedSeatsCount = await _repositoryBlockedSeat.CountByEvendoId(evento.Id);
            var bookedSeatsCount = await _repositoryBoleto.CountByEventoIdAsync(evento.Id);
            int totalSeats = evento.Rows * evento.SeatsPerRow;

            evento.SeatsAvailable = totalSeats - blockedSeatsCount - bookedSeatsCount;

            return evento;
        }

        public async Task<EventoGetDTO> Create(EventoCreateDTO eventoCreateDTO)
        {
            if (eventoCreateDTO.EventoDate < DateTime.Now)
            {
                throw new ArgumentException("La fecha del evento no puede ser en el pasado.");
            }

            var evento = new Evento
            {
                Name = eventoCreateDTO.Name,
                Descrp = eventoCreateDTO.Descrp,
                EventoDate = eventoCreateDTO.EventoDate,
                Location = eventoCreateDTO.Location,
                BannerImageUrl = eventoCreateDTO.BannerImageUrl,
                Rows = eventoCreateDTO.Rows,
                SeatsPerRow = eventoCreateDTO.SeatsPerRow
            };
            await _repositoryEvento.Add(evento);

            return new EventoGetDTO(evento);

        }

        public async Task<EventoGetDTO> GetById(int id)
        {
            var evento = await _repositoryEvento.GetById(id);
            if (evento == null)
            {
                throw new KeyNotFoundException("Evento no encontrado");
            }

            var eventoGetDTO = new EventoGetDTO(evento);

            return await CalculateSeats(eventoGetDTO);
        }

        public async Task<List<EventoGetDTO>> GetAll()
        {
            var eventos = await _repositoryEvento.GetAll();
            return eventos.Select(e => new EventoGetDTO(e)).ToList();
        }

        public async Task Update(int id, EventoUpdateDTO eventoUpdateDTO)
        {
            if (eventoUpdateDTO.EventoDate < DateTime.Now)
            {
                throw new ArgumentException("La fecha del evento no puede ser en el pasado.");
            }

            var eventoToUpdate = await _repositoryEvento.GetById(id);
            if (eventoToUpdate == null)
            {
                throw new KeyNotFoundException("Evento no encontrado");
            }

            // falta validar asientos bloqueados y comprados


            eventoToUpdate.Name = eventoUpdateDTO.Name;
            eventoToUpdate.Descrp = eventoUpdateDTO.Descrp;
            eventoToUpdate.EventoDate = eventoUpdateDTO.EventoDate;
            eventoToUpdate.Location = eventoUpdateDTO.Location;
            eventoToUpdate.BannerImageUrl = eventoUpdateDTO.BannerImageUrl;
            eventoToUpdate.Rows = eventoUpdateDTO.Rows;
            eventoToUpdate.SeatsPerRow = eventoUpdateDTO.SeatsPerRow;

            await _repositoryEvento.Update(eventoToUpdate);
        }

        public async Task<GridDTO> GetGrid(int idEvento)
        {
            var evento = await _repositoryEvento.GetById(idEvento);
            if (evento == null)
            {
                throw new KeyNotFoundException("Evento no encontrado");
            }

            var blockedSeats = await _repositoryBlockedSeat.GetByEventId(idEvento);
            var blockedCoordinates = new HashSet<(int, int)>(
                blockedSeats.Select(bs => (bs.SeatRow, bs.SeatColumn))
            );

            //falta agregar los asientos comprados

            var grid = new GridDTO
            {
                IdEvento = evento.Id,
                rows = new List<GridRowDTO>()
            };

            for (int row = 0; row < evento.Rows; row++)
            {
                var gridRow = new GridRowDTO
                {
                    row = row,
                    seats = new List<GridSeatDTO>()
                };
                for (int column = 0; column < evento.SeatsPerRow; column++)
                {

                    var isBlocked = blockedCoordinates.Contains((row, column));

                    gridRow.seats.Add(new GridSeatDTO
                    {
                        row = row,
                        column = column,
                        type = isBlocked ? TypeGrid.Bloqueado : TypeGrid.Disponible
                    });
                }
                grid.rows.Add(gridRow);
            }

            return grid;
        }

    }
}
