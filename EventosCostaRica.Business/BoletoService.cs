using EventosCostaRica.Data;
using EventosCostaRica.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Business
{
    public interface IBoletoService
    {
        Task<BoletoGetDTO> Create(BoletoCreateDTO dto, string userId);
        Task<BoletoGetDTO> GetById(int id);
        Task<List<BoletoGetDTO>> GetByUserId(string userId);
    }
    public class BoletoService : IBoletoService
    {
        private readonly IRepositoryBoleto _boletoRepository;
        private readonly IRepositoryEvento _eventoRepository;
        private readonly IRepositoryBlockedSeat _blockedSeatRepository;
        public BoletoService(
            IRepositoryBoleto boletoRepository, 
            IRepositoryEvento eventoRepository, 
            IRepositoryBlockedSeat blockedSeatRepository
            )
        {
            _boletoRepository = boletoRepository;
            _eventoRepository = eventoRepository;
            _blockedSeatRepository = blockedSeatRepository;
        }


        public async Task<BoletoGetDTO> Create(BoletoCreateDTO dto, string userId)
        {
            var evento = await _eventoRepository.GetById(dto.EventoId);
            if (evento == null)
            {
                throw new ArgumentException("Evento no encontrado");
            }
            if (dto.SeatRow >= evento.Rows || dto.SeatColumn >= evento.SeatsPerRow)
            {
                throw new ArgumentException("Asiento fuera de rango");
            }
            var existingBoleto = _boletoRepository.GetBySeatAsync(dto.EventoId, dto.SeatRow, dto.SeatColumn).Result;
            if (existingBoleto != null)
            {
                throw new ArgumentException("Asiento ya comprado");
            }

            var blockedSeat = await _blockedSeatRepository.GetByCoord(dto.EventoId, dto.SeatRow, dto.SeatColumn);
            if (blockedSeat != null)
            {
                throw new ArgumentException("Asiento bloqueado");
            }

            var boleto = new Boleto
            {
                EventoId = dto.EventoId,
                SeatRow = dto.SeatRow,
                SeatColumn = dto.SeatColumn,
                PurchaseDate = DateTime.UtcNow,
                UsuarioId = userId
            };
            await _boletoRepository.Add(boleto);
            return new BoletoGetDTO(boleto);

        }

        public async Task<BoletoGetDTO> GetById(int id)
        {
            var boleto = await _boletoRepository.GetById(id);
            if (boleto == null)
            {
                throw new KeyNotFoundException("Boleto no encontrado");
            }
            return new BoletoGetDTO(boleto);
        }

        public async Task<List<BoletoGetDTO>> GetByUserId(string userId)
        {
            var boletos = await _boletoRepository.GetByUserIdAsync(userId);

            if (boletos == null)
            {
                throw new KeyNotFoundException("No se encontraron boletos para el usuario especificado.");
            }

            return boletos.Select(b => new BoletoGetDTO(b)).ToList();
        }

        public async Task<List<BoletoGetDTO>> GetByEventoId(int eventoId)
        {
            var boletos = await _boletoRepository.GetByEventoIdAsync(eventoId);
            if (boletos == null)
            {
                throw new KeyNotFoundException("No se encontraron boletos para el evento especificado.");
            }
            return boletos.Select(b => new BoletoGetDTO(b)).ToList();
        }
    }
}
