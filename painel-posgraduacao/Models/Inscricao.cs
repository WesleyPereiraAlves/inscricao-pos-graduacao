namespace Ufu.Facom.Ppgco.Web.Models
{
    public class Inscricao
    {
        public string nome {get;set;}
        public string email { get;set;}
        public string telefone { get;set;}
        public long curso { get; set; }
        public DateTime ano_conclusao { get; set; }
        public long instituicao { get; set; }
        public long radio1 { get; set; }
        public long radio2 { get; set; }
        public long radio3 { get; set; }
        public long linha_pesquisa { get; set; }
        public long modalidade_vaga { get; set; }
        public string carta_motivacao { get; set; }
        public long item_1 { get; set; }
        public string NomeCandidato { get; set; }
        public string DataCriacao { get; set; }
        public string PosGraduacao { get; set; }
        public string LinhaPesquisa { get; set; }
        public string StatusInscricao { get; set; }
    }
}
