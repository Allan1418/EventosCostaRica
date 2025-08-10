using EventosCostaRica.Business;
using EventosCostaRica.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace EventosCostaRica.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventoController : ControllerBase
    {

        private readonly IEventoService _eventoService;
        public EventoController(IEventoService eventoService)
        {
            _eventoService = eventoService;
        }

        //Elder
        // admin
        [HttpPost]
        [ProducesResponseType(typeof(EventoGetDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EventoGetDTO>> PostEvento([FromBody] EventoCreateDTO eventoCreateDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nuevoEvento = await _eventoService.Create(eventoCreateDTO);
                return CreatedAtAction("GetEvento", new { id = nuevoEvento.Id }, nuevoEvento);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrio un error interno al intentar crear el evento.\n{ex}");
            }
        }

        //Elder
        // cualquiera
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<EventoGetDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<EventoGetDTO>>> GetEventos()
        {
            try
            {
                var eventos = await _eventoService.GetAll();
                return Ok(eventos);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrio un error al obtener los eventos.\n{ex}");
            }
        }

        //Elder
        // cualquiera
        [HttpGet("{id}", Name = "GetEvento")]
        [ProducesResponseType(typeof(EventoGetDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<EventoGetDTO>> GetEvento(int id)
        {
            try
            {
                var evento = await _eventoService.GetById(id);
                return Ok(evento);
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"No se encontro un evento con el ID {id}.");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrio un error al obtener el evento.\n{ex}");
            }
        }

        //Elder
        // cualquiera
        [HttpGet("{id}/grid", Name = "GetEventGrid")]
        [ProducesResponseType(typeof(GridDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GridDTO>> GetEventGrid(int id)
        {
            try
            {
                var grid = await _eventoService.GetGrid(id);
                return Ok(grid);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrio un error al generar la cuadricula.\n{ex}");
            }
        }

        //Elder
        // admin
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status202Accepted)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutEvento(int id, [FromBody] EventoUpdateDTO eventoUpdateDTO)
        {
            try
            {
                await _eventoService.Update(id, eventoUpdateDTO);
                return Accepted();
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"No se encontro un evento con el ID {id}.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ocurrio un error al actualizar el evento.\n{ex}");
            }
        }

    }
}
