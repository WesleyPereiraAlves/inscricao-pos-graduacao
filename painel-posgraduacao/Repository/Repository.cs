using Dapper;
using MySql.Data.MySqlClient;
using System.Data;
using System.Web.Helpers;
using Ufu.Facom.Ppgco.Web.Models;
using Ufu.Facom.Ppgco.Web.Util;

namespace Ufu.Facom.Ppgco.Web.Repository
{
    public class Repository
    {
        public static string ConnectionPpgcoFacom { get; set; }

        public static string BancoPosGraduacao { get; set; }

        public Repository()
        {
            ConnectionPpgcoFacom = Settings.GetConfiguration("appsettings.json")["ConnectionStrings:PpgcoFacom"];

            BancoPosGraduacao = new MySql.Data.MySqlClient.MySqlConnectionStringBuilder(ConnectionPpgcoFacom).Database;

        }

        #region Email

        public EmailSmtp GetContasEmail()
        {
            string query = @"SELECT id AS Id,
									usuario_smtp AS UsuarioSmtp,
									senha_smtp AS SenhaSmtp,
                                    endereco_smtp AS EnderecoSmtp,
                                    porta_smtp AS PortaSmtp,
                                    data_cota_excedida AS DataCotaExcedida
							 FROM email_smtp";

            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();

                var emailSmtp = connection.Query<EmailSmtp>(query).FirstOrDefault();

                connection.Close();

                return emailSmtp;

            }
        }

        public bool UpdateDataCotaExcedida(long id, DateTime? data)
        {
            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();
                string query = $@"UPDATE email_smtp 
								 SET data_cota_excedida = {(data.HasValue ? $"'{data.Value.ToString("yyyy-MM-dd HH:mm:dd")}'" : "null")}
							   WHERE id  = {id};";

                var result = connection.Execute(query) > 0 ? true : false;

                connection.Close();

                return result;
            }
        }

        #endregion

        #region InscricaoPosGraduacao

        public List<Inscricao> GetSolicitacaoInscricao(long member_id, long perfil_id)
        {
            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();
                      string query = @" SELECT DISTINCT m.name AS NomeCandidato, 
									                    mh.data_cadastro AS DataCriacao, 
									                    pg.nome AS PosGraduacao, 
									                    lp.Descricao AS LinhaPesquisa,
									                    sti.descricao AS StatusInscricao
							                    FROM inscricao_pos_graduacao ipg
						                    INNER JOIN pos_graduacao pg ON pg.pos_id = ipg.pos_graduacao_id
						                    INNER JOIN linha_pesquisa lp ON lp.id = ipg.linha_pesquisa_id
						                    INNER JOIN status_inscricao sti ON sti.id = ipg.status_inscricao_id
						                    INNER JOIN member_history mh ON mh.member_id = ipg.usuario_member_id AND mh.member_perfil_id = ipg.usuario_member_perfil_id
						                    INNER JOIN member m ON m.id = mh.member_id AND m.perfil_id = mh.member_perfil_id
	                                            WHERE ipg.usuario_member_id = @member_id
		                                            AND ipg.usuario_member_perfil_id = @perfil_id
                                                    ORDER BY mh.data_cadastro DESC
                                                    LIMIT 1; ";

                var param = new
                {
                    member_id = member_id,
                    perfil_id = perfil_id
                };

                var result = connection.Query<Inscricao>(query, param).ToList();

                connection.Close();
                return result;
            }
        }

        public bool InserthistoricMember(long member_id, long perfil_id, DateTime data_cadastro, string observacao)
        {
            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();
                string query = @" INSERT INTO member_history (member_id, member_perfil_id, data_cadastro, observacao)
                                  VALUES (@member_id, @perfil_id, @data_cadastro, @observacao)";


                var param = new
                {
                    member_id = member_id,
                    perfil_id = perfil_id,
                    data_cadastro = data_cadastro.ToString("yyyy-MM-dd HH:mm:ss"),
                    observacao = observacao
                };

                var result = connection.Execute(query, param) > 0 ? true : false;

                connection.Close();
                return result;
            }
        }

        public bool SaveInscricao(long usuario_member_id, long usuario_member_perfil_id, Inscricao inscricao)
        {

            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();
                using (MySqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var param = new
                        {
                            usuario_member_id = usuario_member_id,
                            usuario_member_perfil_id = usuario_member_perfil_id,
                            nome = inscricao.nome,
                            email = inscricao.email,
                            telefone = inscricao.telefone,
                            curso = inscricao.curso,
                            ano_conclusao = inscricao.ano_conclusao.ToString("yyyy-MM-dd"),
                            instituicao = inscricao.instituicao,
                            radio1 = inscricao.radio1,
                            radio2 = inscricao.radio2,
                            radio3 = inscricao.radio3,
                            linha_pesquisa = inscricao.linha_pesquisa,
                            modalidade_vaga = inscricao.modalidade_vaga,
                            carta_motivacao = inscricao.carta_motivacao,
                            item_1 = inscricao.item_1
                        };

                        string query_member = @" UPDATE member
                                                    SET name = @nome,
											         email = @email, 
													 telefone = @telefone
                                                 WHERE id = @usuario_member_id
                                                    AND perfil_id = @usuario_member_perfil_id;";

                        long result_member = connection.Execute(query_member, param, transaction);

                        if (result_member <= 0 || result_member == null)
                        {
                            transaction.Rollback();
                            return false;
                        }

                        string query_inscricao_pos_graduacao = @" INSERT INTO inscricao_pos_graduacao(pos_graduacao_id,status_inscricao_id,usuario_member_id, usuario_member_perfil_id,linha_pesquisa_id,modalidade_vaga_id,instituicao_id,curso_id,radio1,radio2,radio3,carta_motivacao,ano_conclusao)
                                                 VALUES (1,1,@usuario_member_id,@usuario_member_perfil_id,@linha_pesquisa,@modalidade_vaga,@instituicao, @curso, @radio1, @radio2, @radio3, @carta_motivacao, @ano_conclusao)
                                                 ON DUPLICATE KEY UPDATE
													 linha_pesquisa_id = @linha_pesquisa,
											         modalidade_vaga_id = @modalidade_vaga, 
													 instituicao_id = @instituicao,
                                                     curso_id = @curso,
                                                     radio1 = @radio1,
                                                     radio2 = @radio2,
                                                     radio3 = @radio3,
                                                     carta_motivacao = @carta_motivacao,
                                                     ano_conclusao = @ano_conclusao;";

                        long result_inscricao_id = connection.Execute(query_inscricao_pos_graduacao, param, transaction);

                        if (result_inscricao_id <= 0 || result_inscricao_id == null)
                        {
                            transaction.Rollback();
                            return false;
                        }

                            transaction.Commit();
                            return true;

                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw ex;
                    }
                    finally
                    {
                        if (connection != null && connection.State == ConnectionState.Open)
                            connection.Close();
                    }
                }
            }
        }

        public long GetInscricaoMestrado(long cpd_candidato, long pos_id)
        {
            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();
                string query = @" SELECT COUNT(1) 
                                    FROM inscricaoposgraduacao
                                   WHERE Cpfcandidato = @cpd_candidato
                                     AND Posid = @pos_id; ";

                var param = new
                {
                    cpd_candidato = cpd_candidato,
                    pos_id = pos_id
                };

                var result = connection.Query<long>(query, param).FirstOrDefault();

                connection.Close();
                return result;
            }
        }

        public bool InsertInscricaoMestrado(long cpd_candidato, long pos_id, string nome, string email, string telefone, long curso, DateTime ano_conclusao, string instituicao, bool radio1, bool radio2, bool radio3, long linha_pesquisa, long modalidade_vaga, string carta_motivacao)
        {
            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();
                string query = @" INSERT INTO inscricaoposgraduacao (Cpfcandidato, Posid, nome, email, Telefone, Curso, Anoconclusao, Instituicao, Alunoespecial, Concorreralunoespecial, Bolsadeestudo, Linhadepesquisa, Modalidadevaga, cartademotivacao, data_criacao, status_inscricao, motivo)
                                  VALUES (@cpd_candidato, @pos_id, @nome, @email, @telefone, @curso, @ano_conclusao, @instituicao, @radio1, @radio2, @radio3, @linha_pesquisa, @modalidade_vaga, @carta_motivacao, NOW(), 1, null)";

                var param = new
                {
                    cpd_candidato = cpd_candidato,
                    pos_id = pos_id,
                    nome = nome,
                    email = email,
                    telefone = telefone,
                    curso = curso,
                    ano_conclusao = ano_conclusao,
                    instituicao = instituicao,
                    radio1 = radio1,
                    radio2 = radio2,
                    radio3 = radio3,
                    linha_pesquisa = linha_pesquisa,
                    modalidade_vaga = modalidade_vaga,
                    carta_motivacao = carta_motivacao

                };

                var result = connection.Execute(query, param) > 0 ? true : false;

                connection.Close();
                return result;
            }
        }
        #endregion

        #region Member

        public Usuario GetMemberByLoginAndEmail(string login, string email)
        {
            string query = @"SELECT  id AS Id,
									 login AS Login,
									 password AS Password,
									 name AS Name,
									 email AS Email,
									 active AS Active,
									 password_expired AS PasswordExpired,
                                     perfil_id AS PerfilId
							 FROM member
							 WHERE login = @login
								 AND email = @email";

            var param = new
            {
                login = login,
                email = email
            };

            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();
                var member = connection.Query<Usuario>(query, param).FirstOrDefault();
                connection.Close();

                return member;

            }
        }

        public Usuario GetMemberByLoginAndPerfilId(string login, long perfil_id)
        {
            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();
                string query = @" SELECT  id AS Id,
									 login AS Login,
									 password AS Password,
									 name AS Name,
									 email AS Email,
									 active AS Active,
									 password_expired AS PasswordExpired,
                                     perfil_id AS PerfilId
							 FROM member
							 WHERE login = @login
								 AND perfil_id = @perfil_id";

                var param = new
                {
                    login = login,
                    perfil_id = perfil_id
                };

                var result = connection.Query<Usuario>(query, param).FirstOrDefault();

                connection.Close();
                return result;
            }
        }

        public Usuario GetMemberById(long id)
        {
            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();
                string query = @" SELECT  id AS Id,
									 login AS Login,
									 password AS Password,
									 name AS Name,
									 email AS Email,
									 active AS Active,
									 password_expired AS PasswordExpired,
                                     perfil_id AS PerfilId
							 FROM member
							 WHERE id = @id";

                var param = new
                {
                    id = id
                };

                var result = connection.Query<Usuario>(query, param).FirstOrDefault();

                connection.Close();
                return result;
            }
        }

        public bool UpdatePasswordMember(long userId, long perfil_id, bool passwordExpired, string passwordNew)
        {
            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();
                string query = @" UPDATE member SET password_expired = @passwordExpired, 
                                                    password         = @passwordNew
                                              WHERE id               = @userId
                                                AND perfil_id        = @perfil_id";

                var param = new
                {
                    userId = userId,
                    perfil_id = perfil_id,
                    passwordExpired = passwordExpired,
                    passwordNew = passwordNew
                };

                var result = connection.Execute(query, param) > 0 ? true : false;

                connection.Close();
                return result;
            }
        }

        public bool SaveNewMember(string nome_completo_conta, string email_conta, string login_conta, string password_conta, string cpf_conta, long perfil_pos_conta_login, out long memberId)
        {

            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();
                using (MySqlTransaction transaction = connection.BeginTransaction())
                {
                    try
                    {
                        string query_member = @" INSERT INTO member(login, password, name, email, active, password_expired, perfil_id)
                                                 VALUES (@login_conta,@password_conta,@nome_completo_conta,@email_conta,true,false,@perfil_pos_conta_login);
                                                 SELECT LAST_INSERT_ID() FROM member LIMIT 1 ;";

                        var param = new
                        {
                            nome_completo_conta = nome_completo_conta,
                            email_conta = email_conta,
                            login_conta = login_conta,
                            password_conta = password_conta,
                            cpf_conta = cpf_conta,
                            perfil_pos_conta_login = perfil_pos_conta_login
                        };

                        long member_id = connection.Query<long>(query_member, param, transaction).FirstOrDefault();

                        if (member_id <= 0 || member_id == null)
                        {
                            transaction.Rollback();
                            memberId = member_id;
                            return false;
                        }

                        memberId = member_id;

                        var param2 = new
                        {
                            nome_completo_conta = nome_completo_conta,
                            member_id = member_id,
                            perfil_pos_conta_login = perfil_pos_conta_login
                        };

                        string query_usuario = @" INSERT INTO usuario (nome, data_cadastro, member_id, member_perfil_id)
                                                  VALUES (@nome_completo_conta,now(),@member_id,@perfil_pos_conta_login);
                                                  SELECT LAST_INSERT_ID() FROM usuario LIMIT 1 ;";

                        long member_usuario_id = connection.Query<long>(query_usuario, param2, transaction).FirstOrDefault();


                        if (member_usuario_id > 0 && member_usuario_id != null)
                        {
                            transaction.Commit();
                            return true;
                        }
                        else
                        {
                            transaction.Rollback();
                            return false;
                        }

                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw ex;
                    }
                    finally
                    {
                        if (connection != null && connection.State == ConnectionState.Open)
                            connection.Close();
                    }
                }
            }
        }

        #endregion

        #region TemplateNotificação
        public TemplateNotificacao GetTemplateNotificacaoById(long id)
        {
            string query = @"SELECT id AS Id,
									template_para AS TemplatePara,
									conteudo AS Conteudo
							 FROM template_notificacao
							 WHERE id = @id";

            var param = new { id = id };

            TemplateNotificacao template = new TemplateNotificacao();
            using (MySqlConnection connection = new MySqlConnection(ConnectionPpgcoFacom))
            {
                connection.Open();

                template = connection.Query<TemplateNotificacao>(query, param).FirstOrDefault();

                connection.Close();
            }

            return template;
        }
        #endregion

    }
}
