namespace Ufu.Facom.Ppgco.Web.Models
{
    public class EmailSmtp
    {
        public long Id { get; set; }
        public string UsuarioSmtp { get; set; }
        public string SenhaSmtp { get; set; }
        public string EnderecoSmtp { get; set; }
        public long PortaSmtp { get; set; }
        public DateTime DataCotaExcedida { get; set; }
    }
}
