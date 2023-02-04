using System.Net.Mail;

namespace Ufu.Facom.Ppgco.Web.Util
{
    public class Email
    {
        private Repository.Repository _repo = new Repository.Repository();
        public void EnviarEmailPlus(string message, string assunto, string destinatario, bool isHtml)
        {
            var emails = _repo.GetContasEmail();

            if (emails != null)
            {
                try
                {

                    MailMessage oMail = new MailMessage();
                    oMail.To.Add(destinatario);
                    oMail.From = new MailAddress(emails?.UsuarioSmtp.ToString());
                    oMail.Subject = assunto;
                    oMail.IsBodyHtml = isHtml;
                    oMail.Body = message;

                    //Para evitar problemas de caracteres "estranhos", configuramos o charset para "ISO-8859-1"
                    oMail.SubjectEncoding = System.Text.Encoding.GetEncoding("ISO-8859-1");
                    oMail.BodyEncoding = System.Text.Encoding.GetEncoding("ISO-8859-1");


                    SmtpClient smtp = new SmtpClient(emails?.EnderecoSmtp.ToString(), Convert.ToInt32(emails?.PortaSmtp));
                    smtp.UseDefaultCredentials = false; //Evitar bloqueio na tentativa de login
                    //smtp.Credentials = new System.Net.NetworkCredential(emails?.UsuarioSmtp.ToString(), "vqopdvufcrbhkpzc"); //vqopdvufcrbhkpzc
                    smtp.Credentials = new System.Net.NetworkCredential(emails?.UsuarioSmtp.ToString(), emails?.SenhaSmtp.ToString());
                    smtp.Host = emails?.EnderecoSmtp.ToString();
                    //smtp.Port = 587;
                    smtp.Timeout = 5000;
                    smtp.EnableSsl = true; //Evitar bloqueio na tentativa de login
                    smtp.Send(oMail);

                    if (!string.IsNullOrEmpty(emails?.DataCotaExcedida.ToString()))
                    {
                        _repo.UpdateDataCotaExcedida(Convert.ToInt64(emails.Id), null);
                    }
                }
                catch (Exception ex)
                {
                    if (ex.Message.Contains("user sending quota exceeded"))
                    {
                        if (_repo.UpdateDataCotaExcedida(emails.Id, DateTime.Now))
                        {
                            EnviarEmailPlus(message, assunto, destinatario, isHtml);
                        }
                    }
                    else
                    {
                        throw new Exception("Erro ao enviar email " + ex.Message);
                    }
                }
            }
        }

    }
}
