#! /usr/bin/env node

import { Command } from 'commander';
import { askGemini, model } from '../lib/gemini.js';
import inquirer from 'inquirer';
import fs from 'fs';

const program = new Command();

program
  .name('gemini')
  .description('Gemini AI CLI tool')
  .version('1.0.0')
  .option('-i, --interactive', 'Run in interactive mode')
  .argument('[prompt...]', 'The prompt to send to Gemini');

program.action(async (promptParts, options) => {
  let prompt = promptParts.join(' ');

  // Handle piping
  if (!process.stdin.isTTY) {
    const stdinContent = fs.readFileSync(0, 'utf8');
    prompt = `${prompt}\n\nContext:\n${stdinContent}`;
  }

  if (options.interactive) {
    await runInteractiveMode();
  } else if (prompt) {
    try {
      const response = await askGemini(prompt);
      console.log(response);
    } catch (error: any) {
      console.error('Error:', error.message);
    }
  } else {
    program.help();
  }
});

async function runInteractiveMode() {
  console.log('Gemini Interactive Mode (type "exit" to quit)');
  const chat = model.startChat();

  while (true) {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: 'You:',
      },
    ]);

    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      break;
    }

    try {
      const result = await chat.sendMessage(input);
      const response = await result.response;
      console.log('Gemini:', response.text());
    } catch (error: any) {
      console.error('Error:', error.message);
    }
  }
}

program.parse(process.argv);
