# ICON-CHERRY-PICK

## Purpose
Tracks the imported icon pack and its canonical usage paths in this repo.

## Source and Destination
- Source (external extraction): `./output/icons` from the donor project workflow.
- Destination assets (canonical): `src/assets/icons/nandd/`
- React wrappers (canonical): `src/components/icons/nandd.tsx`

## Imported Set (Current)
- `social-instagram.svg`
- `social-whatsapp.svg`
- `social-youtube.svg`
- `social-telegram.svg`
- `social-telegram-outline.svg`
- `social-phone-call.svg`
- `social-phone-filled.svg`
- `social-google-maps.svg`
- `mobile-bottom-nav-inbox.svg`
- `mobile-bottom-nav-message-circle.svg`
- `mobile-bottom-nav-phone.svg`
- `mobile-bottom-nav-settings.svg`
- `mobile-bottom-nav-users.svg`

## Distribution Contract
- Icons are distributed to relevant UI locations (header actions, contact/social rows, footer, drawer/menu context).
- Bottom icon bar is not part of the current architecture contract.

## Related Rules
- `./01-design-system-styleguide.md`
- `./03-icons-and-safe-area.md`
