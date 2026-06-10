export default function TermsModal({ onAccept, onDecline }) {
  return (
    <div className="terms-overlay" role="dialog" aria-modal="true" aria-label="Termos de Uso e Política de Privacidade">
      <div className="terms-modal">
        <h2>Termos de Uso</h2>
        <div className="terms-content">
          <p><strong>O Arboris.X</strong> é um projeto acadêmico desenvolvido para monitoramento ambiental por meio de sensores de temperatura e umidade integrados a um sistema web e aplicativo.</p>
          <p>O uso desta plataforma destina-se exclusivamente para fins educacionais, demonstrações e avaliações do projeto.</p>
          <p>Os dados cadastrados pelos usuários são utilizados apenas para autenticação e acesso ao sistema.</p>
          <p>Os desenvolvedores não se responsabilizam por interrupções temporárias, indisponibilidade do serviço ou dados inseridos incorretamente pelos usuários.</p>
          <p>Ao utilizar o sistema, o usuário concorda com estes termos.</p>

          <h3>Política de Privacidade</h3>
          <p>O Arboris.X coleta apenas as informações necessárias para o funcionamento do sistema, como nome, e-mail e senha cadastrados pelos usuários.</p>
          <p>As senhas são armazenadas de forma criptografada e não podem ser visualizadas pelos administradores do sistema.</p>
          <p>Os dados coletados são utilizados exclusivamente para autenticação e operação da plataforma.</p>
          <p>Nenhuma informação pessoal é compartilhada com terceiros.</p>
          <p>Por se tratar de um projeto acadêmico, os dados poderão ser removidos após o encerramento das atividades de avaliação e apresentação.</p>
        </div>

        <div className="terms-actions">
          <button className="btn btn-secondary" onClick={onDecline}>Recusar</button>
          <button className="btn btn-primary" onClick={onAccept}>Aceitar e continuar</button>
        </div>
      </div>
    </div>
  )
}
