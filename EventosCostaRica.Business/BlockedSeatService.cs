using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EventosCostaRica.Data;
using EventosCostaRica.Repository;

namespace EventosCostaRica.Business
{
    public interface IBlockedSeatService
    {
        Task Create(BSCreateDTO bsCreateDTO);
        Task Delete(BSDeleteDTO bsDelete);

    }

    public class BlockedSeatService : IBlockedSeatService
    {
        private readonly IRepositoryBlockedSeat _blockedSeatRepository;
        private readonly IRepositoryEvento _eventoRepository;
        private readonly IRepositoryBoleto _boletoRepository;
        public BlockedSeatService(
            IRepositoryBlockedSeat repository, 
            IRepositoryEvento evento,
            IRepositoryBoleto repositoryBoleto
            )
        {
            _blockedSeatRepository = repository;
            _eventoRepository = evento;
            _boletoRepository = repositoryBoleto;
        }

        public async Task Create(BSCreateDTO bsCreateDTO)
        {
            var evento = await _eventoRepository.GetById(bsCreateDTO.EventoId);
            if (evento == null)
            {
                throw new KeyNotFoundException("Evento no existe.");
            }

            if (await _blockedSeatRepository.GetByCoord(bsCreateDTO.EventoId, bsCreateDTO.SeatRow, bsCreateDTO.SeatColumn) != null)
            {
                throw new ArgumentException("Asiento Bloqueado ya existe.");
            }

            if (bsCreateDTO.SeatRow >= evento.Rows || bsCreateDTO.SeatColumn >= evento.SeatsPerRow)
            {
                throw new ArgumentException("Las coordenadas del asiento estan fuera de los limites del evento.");
            }
            if (evento.EventoDate < DateTime.Now)
            {
                throw new ArgumentException("No se puede agregar un asiento bloqueado de un evento que ya ha ocurrido.");
            }

            if (await _boletoRepository.GetBySeatAsync(bsCreateDTO.EventoId, bsCreateDTO.SeatRow, bsCreateDTO.SeatColumn) != null)
            {
                throw new ArgumentException("No se puede bloquear un asiento que ya tiene un boleto vendido.");
            }

            var bs = new BlockedSeat
            {
                EventoId = bsCreateDTO.EventoId,
                SeatRow = bsCreateDTO.SeatRow,
                SeatColumn = bsCreateDTO.SeatColumn,
                Evento = evento
            };

            await _blockedSeatRepository.Add(bs);

        }

        public async Task Delete(BSDeleteDTO bsDelete)
        {
            var seatToDelete = await _blockedSeatRepository.GetByCoord(bsDelete.EventoId, bsDelete.SeatRow, bsDelete.SeatColumn);

            if (seatToDelete == null)
            {
                throw new KeyNotFoundException($"No se encontro el asiento bloqueado.");
            }
            if (seatToDelete.Evento.EventoDate < DateTime.Now)
            {
                throw new ArgumentException("No se puede eliminar un asiento bloqueado de un evento que ya ha ocurrido.");
            }
            await _blockedSeatRepository.DeleteByObj(seatToDelete);
        }

    }
}
