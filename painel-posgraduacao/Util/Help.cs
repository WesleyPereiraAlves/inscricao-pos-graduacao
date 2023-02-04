using System.Collections;
using System.Net.Security;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.RegularExpressions;

namespace Ufu.Facom.Ppgco.Web.Util
{
    public enum TpArq { Imagem, Outros, ExcetoExe }
    public class Help
    {

        public static bool RemoteCertificateValidationCallback(Object sender, X509Certificate certificate, X509Chain chain, SslPolicyErrors sslPolicyErrors)
        {
            return true;
        }

        public static string GerHash(string valor)
        {
            var oMd5 = MD5.Create();
            var inputBytes = Encoding.ASCII.GetBytes(valor);
            var hash = oMd5.ComputeHash(inputBytes);

            var sb = new StringBuilder();
            foreach (var t in hash)
            {
                sb.Append(t.ToString("x2"));
            }
            return sb.ToString();
        }

        public static string[] MultipleFileFilter(string dir)
        {
            const string validExtensions = "*.jpg,*.jpeg,*.gif,*.png";
            var extFilter = validExtensions.Split(',');
            var files = new ArrayList();
            var dirInfo = new DirectoryInfo(dir);
            foreach (var extension in extFilter)
            {
                files.AddRange(dirInfo.GetFiles(extension));
            }
            return (string[])files.ToArray(typeof(string));
        }

        public static bool ValidaExisteArquivo(string caminho, string nomeArquivo)
        {
            return File.Exists(Path.Combine(caminho, nomeArquivo));
        }
        public static void ExcluirArquivo(string caminho, string nomeArquivo)
        {
            File.Delete(Path.Combine(caminho, nomeArquivo));
        }
        public static void CriarDiretorio(string caminho, string nomeDiretorio)
        {
            var newPath = Path.Combine(caminho, nomeDiretorio);

            if (!Directory.Exists(newPath))
            {
                Directory.CreateDirectory(newPath);
            }
        }

        public static bool ValidaTipoArquivo(TpArq tipoArquivo, string extensao)
        {
            if (tipoArquivo == TpArq.Imagem)
            {
                switch (extensao.ToUpper())
                {
                    case ".JPG":
                        return true;
                    case ".JPEG":
                        return true;
                    case ".GIF":
                        return true;
                    case ".PNG":
                        return true;
                }
                return false;
            }
            if (tipoArquivo == TpArq.ExcetoExe)
            {
                return extensao.ToUpper() != ".EXE";
            }

            return true;
        }


        public static bool IsCnpjValido(string cnpj)
        {
            return ValidaCnpj(cnpj);
        }

        private static bool ValidaCnpj(string cnpj)
        {
            cnpj = cnpj.Trim();

            return cnpj.Length == 14 && IsNumber(cnpj) && EfetivaValidacao(cnpj);
        }

        public static bool IsNumber(string valor)
        {
            return double.TryParse(valor, out _);
        }

        private static bool EfetivaValidacao(string cnpj)
        {
            var numero = new int[14];
            var soma = 0;
            var i = 0;
            var resultado1 = 0;

            for (i = 0; i <= numero.Length - 1; i++)
            {
                numero[i] = Convert.ToInt32(cnpj.Substring(i, 1));
            }

            soma = numero[0] * 5 + numero[1] * 4 + numero[2] * 3 + numero[3] * 2 + numero[4] * 9 + numero[5] * 8 + numero[6] * 7 + numero[7] * 6 + numero[8] * 5 + numero[9] * 4 + numero[10] * 3 + numero[11] * 2;

            soma = soma - (11 * (Convert.ToInt32(soma / 11)));
            if (soma == 0 | soma == 1)
            {
                resultado1 = 0;
            }
            else
            {
                resultado1 = 11 - soma;
            }

            if (resultado1 == numero[12])
            {
                soma = numero[0] * 6 + numero[1] * 5 + numero[2] * 4 + numero[3] * 3 + numero[4] * 2 + numero[5] * 9 + numero[6] * 8 + numero[7] * 7 + numero[8] * 6 + numero[9] * 5 + numero[10] * 4 + numero[11] * 3 + numero[12] * 2;
                soma = soma - 11 * Convert.ToInt32(soma / 11);
                int resultado2;
                if (soma == 0 | soma == 1)
                {
                    resultado2 = 0;
                }
                else
                {
                    resultado2 = 11 - soma;
                }
                if (resultado2 == numero[13])
                {
                    return true;
                }

                return false;
            }

            return false;
        }

        public static bool ValidaEmail(string email)
        {
            var emailRegex = @"^(([^<>()[\]\\.,;áàãâäéèêëíìîïóòõôöúùûüç:\s@\""]+"
                    + @"(\.[^<>()[\]\\.,;áàãâäéèêëíìîïóòõôöúùûüç:\s@\""]+)*)|(\"".+\""))@"
                    + @"((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|"
                    + @"(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$";

            var rx = new Regex(emailRegex);

            return rx.IsMatch(email);
        }

    }
}
