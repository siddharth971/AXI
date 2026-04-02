const { execSync } = require('child_process');

async function runContinuously() {
  console.log('🔄 AXI Continuous Autonomous Cycle Started');
  console.log('Press Ctrl+C to stop.\n');

  let cycleCount = 1;
  while (true) {
    console.log(`\n========================================`);
    console.log(`🚀 STARTING AUTONOMOUS CYCLE #${cycleCount}`);
    console.log(`========================================\n`);
    
    try {
      execSync('npm run axi:cycle:single', { stdio: 'inherit' });
    } catch (e) {
      console.error(`\n❌ Cycle #${cycleCount} encountered an error or was interrupted.`);
      console.log('Waiting 10 seconds before continuing to prevent crash loops...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    console.log(`\n✅ Cycle #${cycleCount} completed.`);
    console.log(`⏳ Waiting 15 seconds before starting the next cycle...\n`);
    await new Promise(resolve => setTimeout(resolve, 15000));
    cycleCount++;
  }
}

runContinuously();
