# MCDM Core

This module serves as a common dependency, library, and API manager for all MCDM Products and is available for use by community modules as well. 

The goal of this module is not only to provide a common platform for MCDM development, but also to enable users who have purchased MCDM content to export and take their character to any other FVTT server while still maintaining the system-side support required.

## Current Product Support

### Illrigger

* Custom spellcasting progression for the Architect of Ruin Subclass

### Beastheart and Monstrous Companions

* Caregiver Ferocity linking - monitors changes to a predefined actor data field representing the Ferocity resource.
* User Initiated Operations (Precreated macros for the following operations are included in the `MCDM: Beastheart and Monstrous Companions` Premium module).
  * Linking a Caregiver and their Companion for Ferocity link monitoring.
  * Rolling Ferocity gain at start of turn.
  * Updating a Companion's stats based on the level and wisdom score of its Caregiver.

## Core API

Can be explored via `game.modules.get('mcdm-core')?.api`.

![image](https://user-images.githubusercontent.com/14878515/189013157-f8ff59d7-0e95-43b0-b679-bcbb44143d53.png)

Further API details coming soon.
