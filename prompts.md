# AI Logic Prompts

## Goal
Generate RegEx patterns to parse voice commands for shopping items.

## Prompt 1: Basic Item Parsing (Indonesian)
**Context:** User speaks a shopping list item.
**Input:** "Beli susu ultra 1 liter dan roti tawar dua bungkus"
**Output Format:** JSON
**Task:** Extract item name, quantity, unit.
**Regex Logic:**
- Match numbers or number words (satu, dua, ...)
- Match units (liter, kg, bungkus, ...)
- Match item name (everything else)

## Prompt 2: Basic Item Parsing (English)
**Context:** User speaks a shopping list item.
**Input:** "Buy 2 cartons of milk and a dozen eggs"
**Task:** Extract item name, quantity, unit.
