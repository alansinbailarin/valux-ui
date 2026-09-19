import {
  COLOR_OPTIONS,
  CONTENT_OPTIONS,
  CURSOR_OPTIONS,
  DENSITY_OPTIONS,
  ELEMENT_OPTIONS,
  FONT_OPTIONS,
  ICON_OPTIONS,
  MODE_OPTIONS,
  STATE_OPTIONS,
  VARIANT_OPTIONS,
  WIDTH_OPTIONS,
} from "./showroom.constants";
import type { ShowroomControlsProps } from "./showroom.types";
import { LoadingTextControl } from "./LoadingTextControl";
import { NativeThemeControls } from "./NativeThemeControls";
import { OptionGroup } from "./OptionGroup";

export function ShowroomControls(props: ShowroomControlsProps) {
  return (
    <aside className="space-y-5 border-b border-zinc-200 bg-white p-5 lg:border-r lg:border-b-0 lg:p-6">
      <div>
        <p className="text-sm font-semibold">Theme controls</p>
        <p className="mt-1 text-xs leading-5 text-zinc-500">Button preview</p>
      </div>
      <OptionGroup
        label="Elemento"
        options={ELEMENT_OPTIONS}
        value={props.element}
        onChange={props.onElementChange}
      />
      <OptionGroup
        label="Estado"
        options={STATE_OPTIONS}
        value={props.state}
        onChange={props.onStateChange}
      />
      <LoadingTextControl
        value={props.loadingText}
        onChange={props.onLoadingTextChange}
      />
      <OptionGroup
        label="Variante"
        options={VARIANT_OPTIONS}
        value={props.variant}
        onChange={props.onVariantChange}
      />
      <OptionGroup
        label="Color"
        options={COLOR_OPTIONS}
        value={props.color}
        onChange={props.onColorChange}
      />
      <OptionGroup
        label="Iconos"
        options={ICON_OPTIONS}
        value={props.icons}
        onChange={props.onIconsChange}
      />
      <OptionGroup
        label="Contenido"
        options={CONTENT_OPTIONS}
        value={props.content}
        onChange={props.onContentChange}
      />
      <OptionGroup
        label="Ancho"
        options={WIDTH_OPTIONS}
        value={props.width}
        onChange={props.onWidthChange}
      />
      <OptionGroup
        label="Cursor"
        options={CURSOR_OPTIONS}
        value={props.cursor}
        onChange={props.onCursorChange}
      />
      <OptionGroup
        label="Modo"
        options={MODE_OPTIONS}
        value={props.mode}
        onChange={props.onModeChange}
      />
      <NativeThemeControls
        primary={props.primary}
        tint={props.tint}
        onPrimaryChange={props.onPrimaryChange}
        onTintChange={props.onTintChange}
      />
      <OptionGroup
        label="Densidad"
        options={DENSITY_OPTIONS}
        value={props.density}
        onChange={props.onDensityChange}
      />
      <OptionGroup
        label="Tipografía"
        options={FONT_OPTIONS}
        value={props.font}
        onChange={props.onFontChange}
      />
    </aside>
  );
}
