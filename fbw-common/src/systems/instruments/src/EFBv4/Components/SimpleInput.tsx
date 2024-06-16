import {
  ConsumerSubject,
  FSComponent,
  MappedSubject,
  Subject,
  Subscribable,
  SubscribableUtils,
  VNode,
} from '@microsoft/msfs-sdk';
import { twMerge } from 'tailwind-merge';
import { AbstractUIView } from '../shared/UIView';
import { EFBSimvars } from '../EFBSimvarPublisher';
import { v4 } from 'uuid';

interface SimpleInputProps {
  placeholder?: string | Subscribable<string>;
  value?: Subscribable<string | null>;
  onChange?: (value: string) => void;
  onFocus?: (value: string) => void;
  onBlur?: (value: string) => void;
  min?: number;
  max?: number;
  number?: boolean;
  padding?: number;
  decimalPrecision?: number;
  fontSizeClassName?: string;
  reverse?: boolean; // Flip label/input order;
  containerClass?: string;
  class?: string | Subscribable<string>;
  maxLength?: number;
  disabled?: Subscribable<boolean>;
}

// TODO this is not really a UI View, we need a class that gives context values without the UI view stuff
export class SimpleInput extends AbstractUIView<SimpleInputProps> {
  private readonly guid = v4();

  private readonly inputRef = FSComponent.createRef<HTMLInputElement>();

  private readonly displayValue = Subject.create(this.props.value?.get() ?? '');

  private readonly focused = Subject.create(false);

  private readonly isLookingAtLeftEfb = ConsumerSubject.create(null, false);

  private readonly isLookingAtRightEfb = ConsumerSubject.create(null, false);

  private readonly pad = (value: string): string => {
    if (this.props.padding === undefined) {
      return value;
    }

    const split = value.split('.');

    while (split[0].length < this.props.padding) {
      split[0] = `0${split[0]}`;
    }

    return split.join('.');
  };

  private readonly getConstrainedValue = (value: string): string => {
    if (!this.props.number) {
      return value;
    }
    let constrainedValue = value;
    let numericValue = parseFloat(value);

    if (!Number.isNaN(numericValue)) {
      if (this.props.min !== undefined && numericValue < this.props.min) {
        numericValue = this.props.min;
      } else if (this.props.max !== undefined && numericValue > this.props.max) {
        numericValue = this.props.max;
      }

      if (this.props.decimalPrecision !== undefined) {
        const fixed = numericValue.toFixed(this.props.decimalPrecision);
        constrainedValue = parseFloat(fixed).toString(); // Have to re-parse to remove trailing 0s
      } else {
        constrainedValue = numericValue.toString();
      }
      constrainedValue = this.pad(constrainedValue);
    }
    return constrainedValue;
  };

  private readonly onFocus = (event: FocusEvent): void => {
    this.focused.set(true);

    if (!this.props.disabled?.get()) {
      this.props.onFocus?.((event.target as HTMLInputElement).value);
    }

    // TODO port OSK
    // if (autoOSK) {
    //   setOSKOpen(true);
    //
    //   if (inputRef.current) {
    //     // 450 is just a guesstimate of the keyboard height
    //     const spaceBeforeKeyboard = 1000 - 450;
    //
    //     if (inputRef.current.getBoundingClientRect().bottom > spaceBeforeKeyboard) {
    //       const offset = inputRef.current.getBoundingClientRect().bottom - spaceBeforeKeyboard;
    //
    //       dispatch(setOffsetY(offset));
    //     }
    //   }
    // }
  };

  private readonly onFocusOut = (event: FocusEvent): void => {
    const { value } = event.currentTarget as HTMLInputElement;
    const constrainedValue = this.getConstrainedValue(value);

    this.displayValue.set(constrainedValue);
    this.focused.set(false);
    // TODO port OSK
    // setOSKOpen(false);

    if (!this.props.disabled?.get()) {
      this.props.onBlur?.(constrainedValue);
    }

    // TODO port OSK
    // dispatch(setOffsetY(0));
  };

  private readonly onChange = (event: Event): void => {
    if (!event.target) {
      return;
    }

    if (this.props.disabled?.get()) {
      return;
    }

    let originalValue = (event.target as HTMLInputElement).value;

    if (this.props.number) {
      originalValue = originalValue.replace(/[^\d.-]/g, ''); // Replace all non-numeric characters
    }

    if (this.props.maxLength) {
      originalValue = originalValue.substring(0, this.props.maxLength);
    }

    this.props.onChange?.(originalValue);

    // TODO port the OSK
    // if (keyboard.current) {
    //   keyboard.current.setInput(originalValue);
    // }
    this.displayValue.set(originalValue);
  };

  private readonly onEnterPressedOnDocument = (event: KeyboardEvent) => {
    // 'keyCode' is deprecated but 'key' is not supported in MSFS
    if (event.keyCode === 13) {
      this.blurInputField();
    }
  };

  private readonly onValueExternallyChanged = (value: string) => {
    const constrainedValue = this.getConstrainedValue(value);

    this.displayValue.set(constrainedValue);
  };

  private blurInputField() {
    this.inputRef.getOrDefault()?.blur();
  }

  onAfterRender(node: VNode) {
    super.onAfterRender(node);

    const instrument = document.querySelector('vcockpit-panel > *') as HTMLElement;

    this.inputRef.instance.addEventListener('focus', this.onFocus);
    this.inputRef.instance.addEventListener('blur', this.onFocusOut);
    this.inputRef.instance.addEventListener('change', this.onChange);
    instrument.addEventListener('keypress', this.onEnterPressedOnDocument);

    if (this.props.value) {
      this.subscriptions.push(
        this.props.value.sub((value) => {
          value !== null && this.onValueExternallyChanged(value);
        }, true),
      );
    }

    this.subscriptions.push(
      this.isLookingAtLeftEfb.setConsumer(this.bus.getSubscriber<EFBSimvars>().on('isLookingAtLeftEfb')),
      this.isLookingAtRightEfb.setConsumer(this.bus.getSubscriber<EFBSimvars>().on('isLookingAtRightEfb')),
    );

    // TODO destroy this
    MappedSubject.create(
      ([isLookingAtLeftEfb, isLookingAtRightEfb]) => {
        // we don't want to update this hook when focused changes so it is not a dep
        // we only want to unfocus when the user was looking at the EFB and then looked away
        if (this.focused.get() && !isLookingAtLeftEfb && !isLookingAtRightEfb) {
          this.blurInputField();
        }
      },
      this.isLookingAtRightEfb,
      this.isLookingAtRightEfb,
    );

    // TODO destroy this
    this.focused.sub((focused) => {
      if (focused) {
        Coherent.trigger('FOCUS_INPUT_FIELD', this.guid, '', '', '', false);
      } else {
        Coherent.trigger('UNFOCUS_INPUT_FIELD', this.guid);
      }
    });

    // TODO destroy this
    this.props.value?.sub((value) => {
      if (value === null || value === '') {
        this.displayValue.set('');
        return;
      }

      if (this.focused.get()) return;

      this.displayValue.set(this.getConstrainedValue(value));
    });
  }

  destroy() {
    super.destroy();

    const instrument = document.querySelector('vcockpit-panel > *') as HTMLElement;

    this.inputRef.instance.removeEventListener('focus', this.onFocus);
    this.inputRef.instance.removeEventListener('blur', this.onFocusOut);
    this.inputRef.instance.removeEventListener('change', this.onChange);
    instrument.removeEventListener('keypress', this.onEnterPressedOnDocument);
  }

  private readonly className = MappedSubject.create(
    ([disabled, prop_class]) => {
      return twMerge(
        'w-full px-3 py-1.5 rounded-md border-2 border-theme-accent bg-theme-accent text-theme-text transition duration-100 placeholder:text-theme-unselected focus-within:border-theme-highlight focus-within:outline-none',
        this.props.fontSizeClassName ?? 'text-lg',
        prop_class,
        disabled && 'opacity-50',
      );
    },
    this.props.disabled ?? Subject.create(false),
    SubscribableUtils.toSubscribable(this.props.class ?? '', true),
  );

  render(): VNode | null {
    return (
      <div ref={this.rootRef} class={this.props.containerClass ?? ''}>
        <input
          class={this.className}
          value={this.displayValue}
          placeholder={this.props.placeholder}
          // disabled={this.props.disabled ?? Subject.create(false)}
          ref={this.inputRef}
        />
        {/* TODO port the OSK */}
        {/*{OSKOpen && (*/}
        {/*  <KeyboardWrapper*/}
        {/*    keyboardRef={keyboard}*/}
        {/*    onChangeAll={(v) => onChange(v.default)}*/}
        {/*    blurInput={blurInputField}*/}
        {/*    setOpen={setOSKOpen}*/}
        {/*    onKeyDown={(e) => {*/}
        {/*      if (e === '{bksp}') {*/}
        {/*        onChange(displayValue.slice(0, displayValue.length - 1));*/}
        {/*      }*/}
        {/*    }}*/}
        {/*  />*/}
        {/*)}*/}
      </div>
    );
  }
}
