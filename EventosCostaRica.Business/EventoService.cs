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

        public async Task Update(int id, EventoUpdateDTO dto)
        {
            if (dto.EventoDate < DateTime.Now)
            {
                throw new ArgumentException("La fecha del evento no puede ser en el pasado.");
            }

            var eventoToUpdate = await _repositoryEvento.GetById(id);
            if (eventoToUpdate == null)
            {
                throw new KeyNotFoundException("Evento no encontrado");
            }

            var checkBiggerBoletos = await _repositoryBoleto.CheckBiggers(id, (dto.Rows - 1), (dto.SeatsPerRow - 1));
            if (checkBiggerBoletos)
            {
                throw new ArgumentException($"No se puede poner el nuevo tamaño de {dto.SeatsPerRow}x{dto.Rows}, ya hay boletos fuera del rango.");
            }


            eventoToUpdate.Name = dto.Name;
            eventoToUpdate.Descrp = dto.Descrp;
            eventoToUpdate.EventoDate = dto.EventoDate;
            eventoToUpdate.Location = dto.Location;
            eventoToUpdate.BannerImageUrl = dto.BannerImageUrl;
            eventoToUpdate.Rows = dto.Rows;
            eventoToUpdate.SeatsPerRow = dto.SeatsPerRow;

            await _repositoryEvento.Update(eventoToUpdate);

            await _repositoryBlockedSeat.DeleteBiggers(id, (eventoToUpdate.Rows - 1), (eventoToUpdate.SeatsPerRow - 1));
            


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

            var bookedSeats = await _repositoryBoleto.GetByEventoIdAsync(idEvento);
            var bookedCoordinates = new HashSet<(int, int)>(
                bookedSeats.Select(bs => (bs.SeatRow, bs.SeatColumn))
            );

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
                    var isBooked = bookedCoordinates.Contains((row, column));

                    TypeGrid seatType;

                    if (isBlocked)
                    {
                        seatType = TypeGrid.Bloqueado;
                    }
                    else if (isBooked)
                    {
                        seatType = TypeGrid.Ocupado;
                    }
                    else
                    {
                        seatType = TypeGrid.Disponible;
                    }

                    gridRow.seats.Add(new GridSeatDTO
                    {
                        row = row,
                        column = column,
                        type = seatType
                    });
                }
                grid.rows.Add(gridRow);
            }

            return grid;
        }

    }
}
