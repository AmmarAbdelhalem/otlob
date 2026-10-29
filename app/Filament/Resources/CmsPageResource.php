<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CmsPageResource\Pages;
use App\Models\CmsPage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class CmsPageResource extends Resource
{
    protected static ?string $model = CmsPage::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'Marketing & CMS';

    protected static ?int $navigationSort = 3;

    protected static ?string $recordTitleAttribute = 'title_en';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Page Settings')
                    ->description('General configuration and URL slug for this CMS page')
                    ->schema([
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('slug')
                                    ->required()
                                    ->unique(ignoreRecord: true)
                                    ->prefix('/')
                                    ->helperText('Unique URL path identifier (e.g. privacy-policy, terms-of-service)'),
                                Forms\Components\Toggle::make('is_active')
                                    ->label('Published & Active')
                                    ->default(true)
                                    ->required(),
                            ]),
                    ]),

                Forms\Components\Tabs::make('Content')
                    ->tabs([
                        Forms\Components\Tabs\Tab::make('English Content')
                            ->icon('heroicon-m-language')
                            ->schema([
                                Forms\Components\TextInput::make('title_en')
                                    ->label('Page Title (EN)')
                                    ->required()
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function (string $operation, $state, Forms\Set $set) {
                                        if ($operation === 'create') {
                                            $set('slug', Str::slug($state));
                                        }
                                    }),
                                Forms\Components\RichEditor::make('content_en')
                                    ->label('Body Content (EN)')
                                    ->fileAttachmentsDisk('public')
                                    ->fileAttachmentsDirectory('cms/attachments')
                                    ->fileAttachmentsVisibility('public')
                                    ->toolbarButtons([
                                        'attachFiles',
                                        'blockquote',
                                        'bold',
                                        'bulletList',
                                        'codeBlock',
                                        'h2',
                                        'h3',
                                        'italic',
                                        'link',
                                        'orderedList',
                                        'redo',
                                        'strike',
                                        'underline',
                                        'undo',
                                    ])
                                    ->columnSpanFull(),
                            ]),

                        Forms\Components\Tabs\Tab::make('المحتوى بالعربية (Arabic)')
                            ->icon('heroicon-m-globe-alt')
                            ->schema([
                                Forms\Components\TextInput::make('title_ar')
                                    ->label('عنوان الصفحة (AR)')
                                    ->required(),
                                Forms\Components\RichEditor::make('content_ar')
                                    ->label('محتوى الصفحة (AR)')
                                    ->fileAttachmentsDisk('public')
                                    ->fileAttachmentsDirectory('cms/attachments')
                                    ->fileAttachmentsVisibility('public')
                                    ->toolbarButtons([
                                        'attachFiles',
                                        'blockquote',
                                        'bold',
                                        'bulletList',
                                        'codeBlock',
                                        'h2',
                                        'h3',
                                        'italic',
                                        'link',
                                        'orderedList',
                                        'redo',
                                        'strike',
                                        'underline',
                                        'undo',
                                    ])
                                    ->columnSpanFull(),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title_en')
                    ->label('English Title')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('title_ar')
                    ->label('Arabic Title')
                    ->searchable(),
                Tables\Columns\TextColumn::make('slug')
                    ->label('Slug')
                    ->badge()
                    ->color('gray')
                    ->searchable(),
                Tables\Columns\ToggleColumn::make('is_active')
                    ->label('Active'),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Last Updated')
                    ->dateTime('M d, Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: false),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active Status')
                    ->boolean()
                    ->trueLabel('Active Only')
                    ->falseLabel('Inactive Only'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCmsPages::route('/'),
            'create' => Pages\CreateCmsPage::route('/create'),
            'edit' => Pages\EditCmsPage::route('/{record}/edit'),
        ];
    }
}
