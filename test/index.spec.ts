import {
  Tooltip,
  UnstyledTooltip,
  TooltipShape,
  TooltipAnchor,
} from '../src';

describe('react-tooltip-contemporary', () => {
  describe('public exports', () => {
    it('exports the styled and unstyled tooltip components', () => {
      expect(typeof Tooltip).toBe('function');
      expect(typeof UnstyledTooltip).toBe('function');
    });

    it('exports the TooltipShape subcomponent', () => {
      expect(typeof TooltipShape).toBe('function');
    });

    it('exports the TooltipAnchor subcomponent (forwardRef)', () => {
      // forwardRef components are exotic objects, not plain functions
      expect(typeof TooltipAnchor).toBe('object');
      expect(TooltipAnchor).not.toBeNull();
    });
  });
});
