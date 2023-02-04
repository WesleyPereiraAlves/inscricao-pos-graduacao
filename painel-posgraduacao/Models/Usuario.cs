namespace Ufu.Facom.Ppgco.Web.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool Active { get; set; }
        public bool PasswordExpired { get; set; }
        public int PerfilId { get; set; }

    }
}
