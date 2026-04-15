export function bookingConfirmationEmail({ fullName, bookingDate, slotLabel, startTime, endTime, participants, rentalNeeded }) {
  const date = new Date(bookingDate).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    subject: `Sport&Natura – Prenotazione ricevuta per il ${date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1411; color: #f3f5f7; padding: 2rem; border-radius: 12px;">
        <h1 style="color: #7ba36f;">Sport&Natura</h1>
        <p>Ciao <strong>${fullName}</strong>,</p>
        <p>abbiamo ricevuto la tua richiesta di prenotazione. Ecco il riepilogo:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
          <tr style="border-bottom: 1px solid #2a3a2a;">
            <td style="padding: 0.75rem 0; color: #9db89d;">Data</td>
            <td style="padding: 0.75rem 0;"><strong>${date}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #2a3a2a;">
            <td style="padding: 0.75rem 0; color: #9db89d;">Fascia oraria</td>
            <td style="padding: 0.75rem 0;"><strong>${slotLabel} (${startTime.slice(0,5)} - ${endTime.slice(0,5)})</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #2a3a2a;">
            <td style="padding: 0.75rem 0; color: #9db89d;">Partecipanti</td>
            <td style="padding: 0.75rem 0;"><strong>${participants}</strong></td>
          </tr>
          <tr>
            <td style="padding: 0.75rem 0; color: #9db89d;">Noleggio attrezzatura</td>
            <td style="padding: 0.75rem 0;"><strong>${rentalNeeded ? 'Richiesto' : 'Non richiesto'}</strong></td>
          </tr>
        </table>

        <p style="background: #1a2e1a; padding: 1rem; border-radius: 8px; border-left: 3px solid #7ba36f;">
          La prenotazione è <strong>in attesa di conferma</strong>. Ti contatteremo appena approvata.
        </p>

        <p style="color: #9db89d; font-size: 0.9rem; margin-top: 2rem;">
          Sport&Natura – Campo Softair<br>
          Questa è un'email automatica, non rispondere a questo messaggio.
        </p>
      </div>
    `
  };
}