
Ideia
	Como operador de sistema, devo conseguir cadastrar um novo cartório na base de dados com suas informações básicas e então consulta-lo e alterá-lo sempre que necessário, criar novos documentos e relaciona-los com o cartório, então conseguir criar agendamentos 

	*nomes podem ser melhorados, aqui é conceito*
	Obrigatório DB:
		Cartorio: nome, rua, numero, cidade, UF, CEP 
		Documento: nome
		Agendamento: idCartorio, idDocumento, CPF/CNPJ, tipoPessoa, status, createdDate
		CartorioDocumento: idCartorio, idDocumento
		Postgres
		
	Obrigatório JAVA: 
		Crud de cartório com os dados: nome, endereco e documentos que ele emite
		Crud de documento: apenas o nome
		Crud de agendamento: idCartorio, idDocumento, CPF/CNPJ, status (inicia Pending), tipoPessoa (fisica ou juridica para saber como desmascarar o dado e guardar no DB), data de criacao
		Paginacao em documento
		Api rest para servir os endpoints
		Java 21, Spring Boot, Thymeleaf e postgrees
		
	Obrigatório React/TS:
		Crud das tabelas "CARTORIO", "DOCUMENTO"
		Consumir cartorio e documento via api rest, popular combo-box com preenchimento condicional (ex. validar se aquela documento existe naquele cartorio, nao exibir dados desatualizados e etc)
		Adicionar agendamento via cadastro
		Mascarar CPF/CNPJ de acordo com o combo de pessoa fisica/juridica
		Validar formularios com react-hook-form
		Gerenciamento de estados com context-api / zustand (context é obrigatorio apesar de nao ser o mais performatico)
		Empty space caso não tenha documento
		Toasts de exclusao, adição, alteração
		Mascaras nos campos CPF, CNPJ, CEP
		Buscar endereco via api do VIACEP
		Paginação de documentos (caso ultrapasse 10)
		Adicionar loading durante reqs
		contagem de documentos por cartorio
		Responsividade
		Fidelidade ao layout proposto
		
	Requisitos Gerais:
		Semantica
		Organizacao
		Projeto deve ser dockerizado afim de conseguir ser executado completamente (DB, front, back), enfase em facilidade de configuracao, reprodutibilidade e preenchimento de todos os requisitos.

REPO FRONT: https://github.com/docketbrasil/trabalhe-conosco-frontend
REPO BACK: https://github.com/docketbrasil/trabalhe-conosco-backend-java
LAYOUT: https://xd.adobe.com/view/de1c9231-1542-41b5-ad00-355ebf402162-8b4f/grid
