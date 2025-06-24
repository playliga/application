/**
 * Player card component.
 *
 * @module
 */
import React from 'react';
import { startCase } from 'lodash';
import { Bot, Constants, Eagers, Util } from '@liga/shared';
import { cx } from '@liga/frontend/lib';
import { useTranslation } from '@liga/frontend/hooks';
import { FaCaretDown, FaCaretUp, FaFolderOpen, FaShoppingBag, FaStar } from 'react-icons/fa';

/** @type {Player} */
type Player = Awaited<ReturnType<typeof api.players.all<typeof Eagers.player>>>[number];

/** @interface */
interface XPBarProps {
  max: number;
  value: number;
  className?: string;
  gains?: number;
  high?: number;
  low?: number;
  subtitle?: string;
  title?: string;
}

/** @interface */
interface PlayerCardProps extends React.ComponentProps<'article'> {
  game: Constants.Game;
  player: Omit<Player, 'team'>;
  className?: string;
  collapsed?: boolean;
  compact?: boolean;
  noStats?: boolean;
  onClickStarter?: () => void;
  onClickTransferListed?: () => void;
  onClickViewOffers?: () => void;
  onChangeWeapon?: (weapon: Constants.WeaponTemplate) => void;
}

/**
 * XP bar.
 *
 * @param props Root props.
 * @component
 * @function
 */
export function XPBar(props: XPBarProps) {
  return (
    <div className={cx('stack-y', props.className)}>
      {!!props.title && (
        <div className="stack-x justify-between text-xs">
          <p className="capitalize">
            {props.title.replace(/(delay|time)/i, 'speed')}
            {!!props.gains && (
              <span className="text-success font-mono">
                &nbsp;+{Util.toOptionalDecimal(Math.abs(props.gains))}
              </span>
            )}
          </p>
          {!!props.subtitle && <p className="font-mono">{props.subtitle}</p>}
        </div>
      )}
      <div className="stack-x w-full items-center">
        {!!props.high && !!props.low && (
          <meter
            className="inverted"
            value={props.value}
            max={props.max}
            low={props.low}
            high={props.high}
          />
        )}
        {(!props.high || !props.low) && (
          <progress className="progress" value={props.value} max={props.max} />
        )}
      </div>
    </div>
  );
}

/**
 * Exports this module.
 *
 * @param props Root props.
 * @component
 * @exports
 */
export default function (props: PlayerCardProps) {
  const t = useTranslation('components');
  const [collapsed, setCollapsed] = React.useState(props.collapsed);
  const weapons = React.useMemo(() => Constants.WeaponTemplates[props.game], [props.game]);
  const xp = React.useMemo(() => {
    if (!props.player) {
      return;
    }

    const gains = JSON.parse(props.player.gains || '{}');
    return new Bot.Exp(JSON.parse(props.player.stats), null, gains);
  }, [props.player]);
  const gainsTotal = React.useMemo(
    () =>
      Object.keys(xp.gains)
        .map((key) => xp.gains[key])
        .reduce((total, current) => total + current, 0),
    [xp.gains],
  );

  React.useEffect(() => {
    if (collapsed !== props.collapsed) {
      setCollapsed(props.collapsed);
    }
  }, [props.collapsed]);

  if (collapsed) {
    return (
      <article
        className={cx(
          'player-card',
          props.className,
          props.collapsed && 'player-card-collapsed',
          props.compact && 'player-card-compact',
        )}
      >
        <header className="divide-base-content/10 mb-0! grid grid-cols-4 items-center divide-x">
          <button
            title={t('playerCard.setAsStarter')}
            className="border-0! hover:bg-transparent! disabled:bg-transparent! [&_svg]:hover:text-yellow-500"
            disabled={!props.onClickStarter}
            onClick={props.onClickStarter || null}
          >
            <FaStar className={cx(props.player.starter && 'text-yellow-500')} />
          </button>
          <nav className="center col-span-2 h-full">
            <h3>{props.player.name}</h3>
            <p className="line-clamp-1">
              <span className={cx('fp', props.player.country.code.toLowerCase())} />
              <span>&nbsp;{props.player.country.name}</span>
            </p>
          </nav>
          <aside className="stack-y">
            <p className="text-muted">{t('playerCard.totalXP')}</p>
            <p className="text-2xl! font-black">
              {props.noStats ? '-' : Math.floor(Bot.Exp.getTotalXP(xp.stats))}
            </p>
            <p
              className={cx(
                'before:pr-px',
                gainsTotal <= 0
                  ? 'text-muted before:content-["▸"]'
                  : 'text-success before:content-["▴"]',
              )}
            >
              {Util.toOptionalDecimal(gainsTotal)}
            </p>
          </aside>
        </header>
        <footer>
          <button onClick={() => setCollapsed(!collapsed)}>
            <FaCaretDown />
          </button>
        </footer>
      </article>
    );
  }

  return (
    <article className={cx('player-card', props.className, props.compact && 'player-card-compact')}>
      <header>
        <h3>{props.player.name}</h3>
        <p>
          <span className={cx('fp', props.player.country.code.toLowerCase())} />
          <span>&nbsp;{props.player.country.name}</span>
        </p>
      </header>
      <figure>
        <label className="fieldset text-xs">
          <p>{t('shared.weaponPreference')}</p>
          <select
            className="select select-sm bg-base-300"
            value={props.player.weapon || Constants.WeaponTemplate.AUTO}
            onChange={(event) =>
              props.onChangeWeapon(event.target.value as Constants.WeaponTemplate)
            }
            title={
              props.player.weapon &&
              weapons[props.player.weapon as Constants.WeaponTemplate].join(', ')
            }
          >
            {Object.keys(Constants.WeaponTemplate).map(
              (template: keyof typeof Constants.WeaponTemplate) => (
                <option
                  key={template + props.player.name}
                  value={Constants.WeaponTemplate[template]}
                  title={
                    props.player.weapon && weapons[Constants.WeaponTemplate[template]].join(', ')
                  }
                >
                  {Constants.WeaponTemplate[template]}
                </option>
              ),
            )}
          </select>
        </label>
      </figure>
      <figure>
        <XPBar
          title={t('playerCard.totalXP')}
          subtitle={`${Math.floor(Bot.Exp.getTotalXP(xp.stats))}/${Math.floor(Bot.Exp.getMaximumXP())}`}
          value={Bot.Exp.getTotalXP(xp.stats)}
          max={Bot.Exp.getMaximumXP()}
        />
      </figure>
      {Object.keys(xp.stats).map((stat) => {
        const { gain, value, max } = xp.normalize(stat);

        return (
          <figure key={`xp__${props.player.name}_${stat}`}>
            <XPBar
              title={`${startCase(stat)}`}
              gains={gain}
              subtitle={`${value}/${max}`}
              value={value}
              max={Number(max)}
            />
          </figure>
        );
      })}
      <aside className="grid grid-cols-3">
        <button
          title={t('playerCard.setAsStarter')}
          className="disabled:bg-transparent!"
          disabled={!props.onClickStarter}
          onClick={props.onClickStarter || null}
        >
          <FaStar className={cx(props.player.starter && 'text-yellow-500')} />
        </button>
        <button title={t('playerCard.addToTransferList')} onClick={props.onClickTransferListed}>
          <FaShoppingBag className={cx(props.player.transferListed && 'text-primary')} />
        </button>
        <button title={t('playerCard.viewOffers')} onClick={props.onClickViewOffers}>
          <FaFolderOpen />
        </button>
      </aside>
      <footer>
        <button onClick={() => setCollapsed(!collapsed)}>
          <FaCaretUp />
        </button>
      </footer>
    </article>
  );
}
