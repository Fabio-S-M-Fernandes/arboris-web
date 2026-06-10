function Concept() {
  return (
    <section className="concept-section">
      <h2 translate="no" lang="pt-BR">O Conceito — Hardware</h2>
      <div className="concept-grid">
        <div className="concept-text">
          <p>
            O Arboris.X usa módulos de prototipagem (p.ex. Arduino) equipados com sensores ambientais (temperatura e
            umidade). Esses sensores amostram o ambiente e, em um sistema completo, os dados seriam agregados e enviados
            para um back-end ou broker MQTT. Nesta versão do site mostramos o fluxo conceitual e uma simulação visual
            para demonstrar a interface de operação.
          </p>
          <ul>
            <li>Sensor: DHT22 / AM2302 para leitura de temperatura e umidade.</li>
            <li>Controlador: Arduino (ESP32 em iterações futuras para conectividade Wi‑Fi).</li>
            <li>Transmissão: MQTT / HTTP (implementação futura no App de Controle).</li>
            <li>Objetivo: visualização clara, latência baixa e design corporativo.</li>
          </ul>
        </div>

        <div className="concept-diagram" aria-hidden="true">
          <div>
            <strong>Arduino</strong> → <em>Sensor</em> → <strong>Gateway</strong> → <em>Dashboard (future)</em>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Concept;
