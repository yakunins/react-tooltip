import { Tooltip, TooltipBubble, TooltipAnchor, TooltipPopover } from '../src';

describe('react-tooltip-contemporary', () => {
  describe('public exports', () => {
    it('exports the Tooltip component', () => {
      expect(typeof Tooltip).toBe('function');
    });

    it('exports the TooltipBubble subcomponent', () => {
      expect(typeof TooltipBubble).toBe('function');
    });

    it('exports the TooltipAnchor subcomponent (forwardRef)', () => {
      // forwardRef components are exotic objects, not plain functions
      expect(typeof TooltipAnchor).toBe('object');
      expect(TooltipAnchor).not.toBeNull();
    });

    it('exports the TooltipPopover subcomponent (forwardRef)', () => {
      expect(typeof TooltipPopover).toBe('object');
    });
  });
});
