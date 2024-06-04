export default function AlarmSound() {
  const playAlarm = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, context.currentTime); // Frequency in hertz (A4 note)
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 5);

    gainNode.gain.exponentialRampToValueAtTime(
      0.00001,
      context.currentTime + 5
    );
  };

  return {
    playAlarm,
  };
}
