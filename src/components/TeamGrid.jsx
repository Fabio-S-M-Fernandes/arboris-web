function TeamGrid({ members }) {
  return (
    <section className="team-section">
      <h2 style={{ color: 'var(--text-heading)', fontSize: '1.6rem', marginBottom: '0.75rem' }}>Equipe</h2>
      <div className="team-grid">
        {members.map((member, index) => (
          <article key={index} className="team-card" role="article" aria-label={member.name}>
            <h3 className="member-name" translate="no" lang="pt-BR">{member.name}</h3>
            <p className="member-role" translate="no" lang="pt-BR">{member.role}</p>
            <p className="member-email">{member.email}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TeamGrid;
