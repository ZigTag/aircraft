import { DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

interface RemindersSectionProps {
  title: VNode | string;
}

export class RemindersSection extends DisplayComponent<RemindersSectionProps> {
  render(): VNode {
    return (
      <div class="flex flex-col border-b-2 border-gray-700 pb-6">
        <div class="mb-2 flex flex-row items-center justify-between">
          <h2 class="font-medium">{this.props.title}</h2>
        </div>
        {/** There was a <Link /> here, im not sure why * */}
        {this.props.children}
      </div>
    );
  }
}
